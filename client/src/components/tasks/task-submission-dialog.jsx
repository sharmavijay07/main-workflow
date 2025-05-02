"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Github, Link2 } from "lucide-react"

export function TaskSubmissionDialog({ open, onOpenChange, onSubmit, existingSubmission }) {
  const [formData, setFormData] = useState({
    githubLink: existingSubmission?.githubLink || "",
    additionalLinks: existingSubmission?.additionalLinks || "",
    notes: existingSubmission?.notes || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.githubLink) {
      newErrors.githubLink = "GitHub link is required"
    } else if (!isValidUrl(formData.githubLink)) {
      newErrors.githubLink = "Please enter a valid URL"
    } else if (!formData.githubLink.includes("github.com")) {
      newErrors.githubLink = "Please enter a valid GitHub URL"
    }

    if (formData.additionalLinks && !isValidUrl(formData.additionalLinks)) {
      newErrors.additionalLinks = "Please enter a valid URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (error) {
      console.error("Error submitting task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="dialog-overlay">
      <DialogContent className="dialog-content sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{existingSubmission ? "Edit Submission" : "Submit Task"}</DialogTitle>
          <DialogDescription>
            {existingSubmission
              ? "Update your task submission details below."
              : "Provide your GitHub repository link and any additional information."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="githubLink" className="flex items-center gap-1">
              <Github className="h-4 w-4" />
              GitHub Repository Link <span className="text-red-500">*</span>
            </Label>
            <Input
              id="githubLink"
              name="githubLink"
              placeholder="https://github.com/username/repository"
              value={formData.githubLink}
              onChange={handleChange}
              className={errors.githubLink ? "border-red-500" : ""}
            />
            {errors.githubLink && <p className="text-xs text-red-500">{errors.githubLink}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalLinks" className="flex items-center gap-1">
              <Link2 className="h-4 w-4" />
              Additional Links (Optional)
            </Label>
            <Input
              id="additionalLinks"
              name="additionalLinks"
              placeholder="https://example.com/demo"
              value={formData.additionalLinks}
              onChange={handleChange}
              className={errors.additionalLinks ? "border-red-500" : ""}
            />
            {errors.additionalLinks && <p className="text-xs text-red-500">{errors.additionalLinks}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional information about your submission..."
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : existingSubmission ? "Update Submission" : "Submit Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
