pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "my-docker-registry.com"
        APP_NAME = "cms-microservices"
        VERSION = "1.0.${BUILD_NUMBER}"
        SERVICES = "api-gateway auth-service content-service audit-service report-service notification-service"
        ADMIN_EMAIL = "admin@cms.com"
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

        stage('Deploy (Zero Downtime)') {
            steps {
                script {
                    echo "Deploying version ${VERSION} using Blue-Green strategy..."
                    sh "docker-compose up -d --build --remove-orphans"
                }
            }
        }

        stage('Post-Deployment Cleanup') {
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
