import React, { useState } from "react";
import { createUser } from "../api/adminService";
import {
  Button,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";

interface CreateUsersProps {
  onUserCreated?: () => void;
}

const CreateUsers: React.FC<CreateUsersProps> = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setSuccess("User created successfully!");
      setError("");

      // Réinitialisation du formulaire
      setFormData({ email: "", firstName: "", lastName: "", role: "user" });

      // Petit délai avant d'appeler le callback ou fermer la modale
      if (onUserCreated) {
        setTimeout(() => {
          onUserCreated();
        }, 800);
      }
    } catch (err) {
      setError("Failed to create user");
      setSuccess("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {error && (
        <Text as="div" className="mb-2" color="tomato">
          {error}
        </Text>
      )}
      {success && (
        <Text as="div" className="mb-2" color="green">
          {success}
        </Text>
      )}

      <Flex direction="column" gap="3">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Email
          </Text>
            <TextField.Root
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter the user's email"
              required
            />
        </label>

        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            First Name
          </Text>
            <TextField.Root
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter the first name"
              required
            />
        </label>

        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Last Name
          </Text>
            <TextField.Root
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter the last name"
              required
            />
        </label>

        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Role
          </Text>
          <Select.Root defaultValue={formData.role}>
                <Select.Trigger />
                <Select.Content >
                    <Select.Group >
                        <Select.Label>Role</Select.Label>
                        <Select.Item value="user">User</Select.Item>
                        <Select.Item value="admin">Admin</Select.Item>
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </label>
      </Flex>

      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close >
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>

        <Button type="submit">
          Create User
        </Button>
      </Flex>
    </form>
  );
};

export default CreateUsers;
