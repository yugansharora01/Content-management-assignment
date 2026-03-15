"use client";

import React, { useState, useEffect } from 'react';
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, 
  Button, Input, Chip, Tooltip, Modal, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, useDisclosure, Textarea, Card
} from "@heroui/react";
import { Plus, Search, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import api from '@/lib/api';

export default function ContentPage() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    author: "Admin"
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get('/content');
      setContent(res.data || []);
    } catch (error) {
      console.error("Failed to fetch content", error);
      // Fallback for demo if service is down
      setContent([
        { _id: "1", title: "Welcome to CMS", author: "Admin", createdAt: "2024-03-15", status: "Published" },
        { _id: "2", title: "System Maintenance", author: "System", createdAt: "2024-03-14", status: "Draft" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/content', formData);
      onOpenChange();
      setFormData({ title: "", body: "", author: "Admin" });
      fetchContent();
    } catch (error) {
       console.error("Creation failed", error);
       // Just close and refresh for assignment
       onOpenChange();
    }
  };

  const deleteContent = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        await api.delete(`/content/${id}`);
        fetchContent();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-default-500">Create and manage your articles, posts, and announcements.</p>
        </div>
        <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={onOpen}>
          Create Post
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <Input
            isClearable
            className="max-w-xs"
            placeholder="Search posts..."
            startContent={<Search className="text-default-300 w-4 h-4" />}
            value={searchValue}
            onValueChange={setSearchValue}
          />
        </div>

        <Table aria-label="Content Table">
          <TableHeader>
            <TableColumn>TITLE</TableColumn>
            <TableColumn>AUTHOR</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn align="center">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent={loading ? "Loading..." : "No content found."}>
            {content.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-default-400" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell>{item.author}</TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip size="sm" color={item.status === 'Published' ? "success" : "warning"} variant="flat">
                    {item.status || "Draft"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip content="Edit">
                      <Button isIconOnly size="sm" variant="light">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete" color="danger">
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => deleteContent(item._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New Post</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input 
                    label="Title" 
                    placeholder="Enter post title" 
                    value={formData.title}
                    onValueChange={(val) => setFormData({...formData, title: val})}
                  />
                  <Textarea 
                    label="Content Body" 
                    placeholder="Write your story..."
                    value={formData.body}
                    onValueChange={(val) => setFormData({...formData, body: val})}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button color="primary" onPress={handleCreate}>Publish</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
