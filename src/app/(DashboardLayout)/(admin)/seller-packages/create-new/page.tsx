"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TextField, Button, FormControlLabel, Switch, Box, Typography, Paper, CircularProgress } from "@mui/material"
import { IconUpload, IconX, IconArrowLeft } from "@tabler/icons-react"
import { message } from "antd"

import { useCreateSellerPackage } from "@/hooks/seller-package"

export default function CreateSellerPackagePage() {
  const router = useRouter()
  const createPackageMutation = useCreateSellerPackage()

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    image: "",
    isActive: true,
    duration: 30,
    percentProfit: 0,
    maxProducts: 10,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // In a real app, you would upload this to a server and get a URL back
      // For now, we'll just set a placeholder
      setFormData((prev) => ({
        ...prev,
        image: "image-url-placeholder",
      }))
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    setFormData((prev) => ({
      ...prev,
      image: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createPackageMutation.mutateAsync(formData)
      message.success("Seller package created successfully!")
      router.push("/seller-packages")
    } catch (error) {
      message.error("Failed to create seller package. Please try again.")
      console.error(error)
    }
  }

  return (
    <div className="p-6">
      <Box className="flex items-center mb-6">
        <Button
          variant="text"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push("/seller-packages")}
          className="mr-4 text-gray-300 hover:text-white"
        >
          Back
        </Button>
        <Typography variant="h5" className="font-bold text-white">
          Create New Seller Package
        </Typography>
      </Box>

      <Paper className="p-6 border border-gray-700 bg-main-gunmetal-blue">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField
              label="Package Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              className="rounded bg-main-dark-blue"
              InputLabelProps={{ className: "text-gray-300" }}
              InputProps={{ className: "text-white" }}
            />

            <TextField
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              className="rounded bg-main-dark-blue"
              InputLabelProps={{ className: "text-gray-300" }}
              InputProps={{ className: "text-white" }}
            />
          </div>

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            className="rounded bg-main-dark-blue"
            InputLabelProps={{ className: "text-gray-300" }}
            InputProps={{ className: "text-white" }}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <TextField
              label="Duration (days)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              className="rounded bg-main-dark-blue"
              InputLabelProps={{ className: "text-gray-300" }}
              InputProps={{ className: "text-white" }}
            />

            <TextField
              label="Percent Profit"
              name="percentProfit"
              type="number"
              value={formData.percentProfit}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              className="rounded bg-main-dark-blue"
              InputLabelProps={{ className: "text-gray-300" }}
              InputProps={{ className: "text-white" }}
            />

            <TextField
              label="Max Products"
              name="maxProducts"
              type="number"
              value={formData.maxProducts}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              className="rounded bg-main-dark-blue"
              InputLabelProps={{ className: "text-gray-300" }}
              InputProps={{ className: "text-white" }}
            />
          </div>

          <div className="mt-6">
            <Typography variant="subtitle1" className="mb-2 text-white">
              Package Image
            </Typography>

            {imagePreview ? (
              <div className="relative w-40 h-40 overflow-hidden border border-gray-600 rounded">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Package preview"
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute p-1 transition-colors bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                >
                  <IconX size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-40 h-40 transition-colors border-2 border-gray-500 border-dashed rounded-lg cursor-pointer hover:bg-main-dark-blue">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <IconUpload size={24} className="mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">Click to upload</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <FormControlLabel
            control={<Switch checked={formData.isActive} onChange={handleChange} name="isActive" color="primary" />}
            label="Active"
            className="text-white"
          />

          <Box className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.push("/seller-packages")}
              className="text-gray-300 border-gray-500 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createPackageMutation.isPending}
              className="text-black bg-main-golden-orange hover:bg-amber-600"
            >
              {createPackageMutation.isPending ? (
                <CircularProgress size={24} className="text-gray-800" />
              ) : (
                "Create Package"
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  )
}

