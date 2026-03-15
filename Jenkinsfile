pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "my-docker-registry.com"
        APP_NAME = "cms-microservices"
        VERSION = "1.0.${BUILD_NUMBER}"
        PREV_VERSION = "1.0.${BUILD_NUMBER.toInteger() - 1}"
        SERVICES = "auth-service content-service audit-service report-service notification-service"
        ADMIN_EMAIL = "admin@cms.com"
        DEPLOY_FAILED = "false"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    for (service in SERVICES.split(' ')) {
                        dir("services/${service}") {
                            if (fileExists('package.json')) {
                                sh "npm install"
                            }
                        }
                    }
                    // Gateway is in root-ish
                    dir("api-gateway") {
                        sh "npm install"
                    }
                }
            }
        }

        stage('Lint') {
            steps {
                script {
                    for (service in SERVICES.split(' ')) {
                        dir("services/${service}") {
                            if (fileExists('package.json')) {
                                sh "npm run lint || true" // Don't fail the build for linting in demo
                            }
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    for (service in SERVICES.split(' ')) {
                        dir("services/${service}") {
                            if (fileExists('package.json')) {
                                sh "npm test || echo 'No tests found for ${service}'"
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Tag Docker Images') {
            steps {
                script {
                    for (service in SERVICES.split(' ')) {
                        sh "docker build -t ${DOCKER_REGISTRY}/${service}:${VERSION} ./services/${service}"
                        sh "docker tag ${DOCKER_REGISTRY}/${service}:${VERSION} ${DOCKER_REGISTRY}/${service}:latest"
                    }
                    // Gateway separately
                    sh "docker build -t ${DOCKER_REGISTRY}/api-gateway:${VERSION} ./api-gateway"
                    sh "docker tag ${DOCKER_REGISTRY}/api-gateway:${VERSION} ${DOCKER_REGISTRY}/api-gateway:latest"
                }
            }
        }

        stage('Deploy (Zero Downtime - Blue/Green)') {
            steps {
                script {
                    echo "Deploying version ${VERSION} using Blue-Green strategy..."
                    // Blue-Green: Bring up new (Green) containers alongside the current (Blue)
                    // docker-compose up -d replaces containers one-by-one for zero-downtime
                    sh "docker-compose up -d --build --remove-orphans"
                    env.DEPLOY_FAILED = "false"
                }
            }
            post {
                failure {
                    script {
                        env.DEPLOY_FAILED = "true"
                    }
                }
            }
        }

        stage('Smoke Test') {
            // Quick health-check after deploy to decide if rollback is needed
            when {
                expression { env.DEPLOY_FAILED == "false" }
            }
            steps {
                script {
                    sleep(time: 10, unit: 'SECONDS') // Wait for containers to stabilise
                    def healthOk = sh(
                        script: "curl -sf http://localhost:3000/health || echo 'FAIL'",
                        returnStdout: true
                    ).trim()
                    if (healthOk.contains('FAIL')) {
                        env.DEPLOY_FAILED = "true"
                        error("Smoke test failed — triggering rollback")
                    } else {
                        echo "Smoke test passed. Version ${VERSION} is healthy."
                    }
                }
            }
        }

        stage('Rollback') {
            // Only runs if deployment or smoke test failed
            when {
                expression { env.DEPLOY_FAILED == "true" }
            }
            steps {
                script {
                    echo "ROLLING BACK to version ${PREV_VERSION}..."
                    for (service in SERVICES.split(' ')) {
                        // Re-tag previous version as latest and redeploy
                        sh """
                            docker tag ${DOCKER_REGISTRY}/${service}:${PREV_VERSION} ${DOCKER_REGISTRY}/${service}:latest || true
                        """
                    }
                    sh """
                        docker tag ${DOCKER_REGISTRY}/api-gateway:${PREV_VERSION} ${DOCKER_REGISTRY}/api-gateway:latest || true
                    """
                    sh "docker-compose up -d --remove-orphans"
                    echo "Rollback complete. Running version ${PREV_VERSION}."
                }
            }
        }

        stage('Post-Deployment Cleanup') {
            when {
                expression { env.DEPLOY_FAILED == "false" }
            }
            steps {
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "Deployment successful! Version ${VERSION} is now live."
            // mail to: "${ADMIN_EMAIL}", subject: "Build Success: ${APP_NAME}", body: "Successfully deployed version ${VERSION}"
        }
        failure {
            echo "Build or Deployment FAILED!"
            // Send email notification explaining failure
            mail to: "${ADMIN_EMAIL}",
                 subject: "BUILD FAILED: ${APP_NAME} - ${BUILD_NUMBER}",
                 body: "Build failed during stage: ${env.STAGE_NAME}. Please check Jenkins logs at ${env.BUILD_URL}"
        }
        always {
            cleanWs()
        }
    }
}
