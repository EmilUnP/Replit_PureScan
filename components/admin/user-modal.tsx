'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'
import { X, Save, User } from 'lucide-react'

interface UserWithStats extends Tables<'profiles'> {
  scan_count?: number
  achievement_count?: number
  last_active?: string
}

interface UserModalProps {
  user: UserWithStats | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  isCreating: boolean
}

export function UserModal({ user, isOpen, onClose, onSave, isCreating }: UserModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    age: '',
    skin_type: '' as 'normal' | 'oily' | 'dry' | 'combination' | 'sensitive' | '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user && !isCreating) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        bio: user.bio || '',
        age: user.age?.toString() || '',
        skin_type: user.skin_type || '',
      })
    } else if (isOpen && isCreating) {
      setFormData({
        full_name: '',
        email: '',
        bio: '',
        age: '',
        skin_type: '',
      })
    }
    setError(null)
  }, [isOpen, user, isCreating])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isCreating) {
        // For creating users, you'd typically need to use Supabase Admin API
        // This is a simplified version - in production, this should be done server-side
        alert('User creation would be implemented with proper admin authentication')
      } else if (user) {
        // Update existing user
        const updateData = {
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          age: formData.age ? parseInt(formData.age) : null,
          skin_type: formData.skin_type || null,
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)

        if (updateError) throw updateError
      }

      onSave()
    } catch (err) {
      console.error('Error saving user:', err)
      setError(err instanceof Error ? err.message : 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Create New User' : 'Edit User'}
              </h2>
              <p className="text-sm text-gray-500">
                {isCreating ? 'Add a new user to the system' : 'Update user information'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
              disabled={!isCreating} // Email shouldn't be editable for existing users
            />
            {!isCreating && (
              <p className="text-xs text-gray-500">Email cannot be modified for existing users</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Enter age"
              min="1"
              max="120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skin_type">Skin Type</Label>
            <select
              id="skin_type"
              value={formData.skin_type}
              onChange={(e) => setFormData({ ...formData, skin_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select skin type</option>
              <option value="normal">Normal</option>
              <option value="oily">Oily</option>
              <option value="dry">Dry</option>
              <option value="combination">Combination</option>
              <option value="sensitive">Sensitive</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Enter user bio"
              rows={3}
            />
          </div>

          {!isCreating && user && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">User Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">{user.scan_count || 0}</div>
                  <div className="text-gray-500">Total Scans</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">{user.achievement_count || 0}</div>
                  <div className="text-gray-500">Achievements</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
                {user.last_login_at && (
                  <div>Last login: {new Date(user.last_login_at).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.email}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating ? 'Create User' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 