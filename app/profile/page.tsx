'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import { supabase } from '@/lib/supabase'
import { ProfileAvatar } from '@/components/profile/profile-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Edit, 
  Save, 
  X, 
  MapPin, 
  User as UserIcon, 
  Calendar,
  Activity,
  Heart,
  Shield,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { Database } from '@/types/database'
import { sanitizeNameInput, sanitizeTextInput, validateFile } from '@/lib/utils'
import { checkProfileCompletion } from '@/lib/achievements'

type Profile = Database['public']['Tables']['profiles']['Row']
type SkinType = Database['public']['Enums']['skin_type']

const skinTypeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'oily', label: 'Oily' },
  { value: 'dry', label: 'Dry' },
  { value: 'combination', label: 'Combination' },
  { value: 'sensitive', label: 'Sensitive' },
]

const genderOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

const activityLevelOptions = [
  { value: 'low', label: 'Low (Sedentary)' },
  { value: 'moderate', label: 'Moderate (Regular exercise)' },
  { value: 'high', label: 'High (Very active)' },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [notifications, setNotifications] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null)

  // Form state with extended fields
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    age: '',
    skin_type: '' as SkinType | '',
    gender: '',
    location: '',
    activity_level: '',
    skin_concerns: '',
    allergies: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (notifications) {
      const timer = setTimeout(() => {
        setNotifications(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotifications({ type, message })
  }

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      
      // Extract additional data from preferences JSON
      const prefs = data.preferences as any || {}
      const additionalInfo = prefs.additional_info || {}
      
      setFormData({
        full_name: data.full_name || '',
        bio: data.bio || '',
        age: data.age?.toString() || '',
        skin_type: data.skin_type || '',
        gender: additionalInfo.gender || '',
        location: additionalInfo.location || '',
        activity_level: additionalInfo.activity_level || '',
        skin_concerns: additionalInfo.skin_concerns || '',
        allergies: additionalInfo.allergies || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      showNotification('error', 'Failed to load profile. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let sanitizedValue = value
    
    // Apply different sanitization based on field type
    if (field === 'full_name') {
      sanitizedValue = sanitizeNameInput(value)
    } else if (field === 'bio' || field === 'skin_concerns' || field === 'allergies') {
      sanitizedValue = sanitizeTextInput(value)
    } else {
      sanitizedValue = value.trim()
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }))
  }

  const handleAvatarChange = async (file: File) => {
    if (!user) return

    // Clear previous messages
    setNotifications(null)

    // Validate file first
    const validation = validateFile(file)
    if (!validation.valid) {
      showNotification('error', validation.error || 'Invalid file')
      return
    }

    setIsUploadingAvatar(true)
    try {
      // Create unique filename with user folder structure for RLS
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        // Provide more specific error messages
        if (uploadError.message.includes('Bucket not found')) {
          showNotification('error', 'Avatar storage is not configured yet. Please contact support to set up image uploads.')
        } else if (uploadError.message.includes('File size')) {
          showNotification('error', 'File size too large. Maximum size is 5MB.')
        } else if (uploadError.message.includes('Invalid file type')) {
          showNotification('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed.')
        } else {
          showNotification('error', `Upload failed: ${uploadError.message}`)
        }
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        showNotification('error', 'Failed to update profile picture. Please try again.')
        return
      }

      // Update local state
      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl })
      }

      showNotification('success', 'Profile picture updated successfully!')

    } catch (error) {
      console.error('Unexpected error:', error)
      showNotification('error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setIsSaving(true)
    try {
      // Prepare data with proper types
      const age = formData.age ? parseInt(formData.age) : null
      
      // Prepare additional info for preferences
      const additionalInfo = {
        gender: formData.gender,
        location: formData.location,
        activity_level: formData.activity_level,
        skin_concerns: formData.skin_concerns,
        allergies: formData.allergies
      }
      
      // Get existing preferences and merge with additional info
      const existingPrefs = profile.preferences as any || {}
      const updatedPreferences = {
        ...existingPrefs,
        additional_info: additionalInfo
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          age: age,
          skin_type: formData.skin_type || null,
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile data
      await fetchProfile()
      
      // Check for profile completion achievement
      await checkProfileCompletion(user.id)
      
      setIsEditing(false)
      
      // Show success message with saved fields
      const savedFields = []
      if (formData.full_name) savedFields.push('name')
      if (formData.bio) savedFields.push('bio')
      if (formData.age) savedFields.push('age')
      if (formData.skin_type) savedFields.push('skin type')
      if (formData.gender) savedFields.push('gender')
      if (formData.location) savedFields.push('location')
      if (formData.activity_level) savedFields.push('activity level')
      if (formData.skin_concerns) savedFields.push('skin concerns')
      if (formData.allergies) savedFields.push('allergies')
      
      showNotification('success', `Profile updated successfully! Saved: ${savedFields.join(', ')}`)
    } catch (error) {
      console.error('Error updating profile:', error)
      showNotification('error', 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current profile data
    const prefs = profile?.preferences as any || {}
    const additionalInfo = prefs.additional_info || {}
    
    setFormData({
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      age: profile?.age?.toString() || '',
      skin_type: profile?.skin_type || '',
      gender: additionalInfo.gender || '',
      location: additionalInfo.location || '',
      activity_level: additionalInfo.activity_level || '',
      skin_concerns: additionalInfo.skin_concerns || '',
      allergies: additionalInfo.allergies || ''
    })
    setIsEditing(false)
  }

  const NotificationBanner = () => {
    if (!notifications) return null

    const { type, message } = notifications
    const iconMap = {
      success: <CheckCircle className="h-5 w-5" />,
      error: <XCircle className="h-5 w-5" />,
      info: <Info className="h-5 w-5" />
    }

    const colorMap = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    }

    return (
      <div className={`p-4 rounded-lg border flex items-center gap-3 mb-6 ${colorMap[type]}`}>
        {iconMap[type]}
        <p className="text-sm font-medium">{message}</p>
        <button 
          onClick={() => setNotifications(null)}
          className="ml-auto hover:opacity-70"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center h-96">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't load your profile information.</p>
          <Button onClick={fetchProfile} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Get additional info from preferences
  const prefs = profile.preferences as any || {}
  const additionalInfo = prefs.additional_info || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Notification Banner */}
        <NotificationBanner />

        {/* Edit Button */}
        <div className="flex justify-end mb-8">
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? 
              "border-gray-300 hover:bg-gray-50" : 
              "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            }
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6">
                <CardTitle className="text-xl font-bold text-white">Personal Information</CardTitle>
                <CardDescription className="text-blue-100">
                  {isEditing ? 'Update your personal details' : 'Your profile information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <ProfileAvatar
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Profile'}
                      size="xl"
                      editable={isEditing}
                      onImageChange={handleAvatarChange}
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <LoadingSpinner />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.full_name || 'Anonymous User'}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {profile.email}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4" />
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                    {additionalInfo.location && (
                      <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {additionalInfo.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Enter your full name"
                        className="mt-2"
                      />
                    ) : (
                      <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg">
                        {profile.full_name || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="age" className="text-sm font-semibold text-gray-700">Age</Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="Age"
                        min="13"
                        max="120"
                        className="mt-2"
                      />
                    ) : (
                      <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg">
                        {profile.age || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={3}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg min-h-[80px]">
                      {profile.bio || 'No bio provided'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</Label>
                    {isEditing ? (
                      <Select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        options={[
                          { value: '', label: 'Select gender' },
                          ...genderOptions
                        ]}
                        className="mt-2"
                      />
                    ) : (
                      <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg capitalize">
                        {additionalInfo.gender || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, Country"
                        className="mt-2"
                      />
                    ) : (
                      <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg">
                        {additionalInfo.location || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="skin_type" className="text-sm font-semibold text-gray-700">Skin Type</Label>
                    {isEditing ? (
                      <Select
                        value={formData.skin_type}
                        onChange={(e) => handleInputChange('skin_type', e.target.value)}
                        options={[
                          { value: '', label: 'Select skin type' },
                          ...skinTypeOptions
                        ]}
                        className="mt-2"
                      />
                    ) : (
                      <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg capitalize">
                        {profile.skin_type || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="activity_level" className="text-sm font-semibold text-gray-700">Activity Level</Label>
                    {isEditing ? (
                      <Select
                        value={formData.activity_level}
                        onChange={(e) => handleInputChange('activity_level', e.target.value)}
                        options={[
                          { value: '', label: 'Select activity level' },
                          ...activityLevelOptions
                        ]}
                        className="mt-2"
                      />
                    ) : (
                      <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg">
                        {additionalInfo.activity_level ? 
                          activityLevelOptions.find(opt => opt.value === additionalInfo.activity_level)?.label
                          : 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="skin_concerns" className="text-sm font-semibold text-gray-700">Skin Concerns</Label>
                  {isEditing ? (
                    <Textarea
                      id="skin_concerns"
                      value={formData.skin_concerns}
                      onChange={(e) => handleInputChange('skin_concerns', e.target.value)}
                      placeholder="Acne, wrinkles, dryness, etc."
                      rows={2}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg min-h-[60px]">
                      {additionalInfo.skin_concerns || 'None specified'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="allergies" className="text-sm font-semibold text-gray-700">Known Allergies</Label>
                  {isEditing ? (
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="Any known allergies or sensitivities"
                      rows={2}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-gray-900 p-3 bg-gray-50 rounded-lg min-h-[60px]">
                      {additionalInfo.allergies || 'None specified'}
                    </p>
                  )}
                </div>

                {/* Save/Cancel buttons */}
                {isEditing && (
                  <div className="flex gap-4 pt-6 border-t">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex-1"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner />
                          <span className="ml-2">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Profile Stats or Quick Actions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Profile Information</span>
                    <span className="font-medium">
                      {[
                        profile.full_name,
                        profile.bio,
                        profile.age,
                        profile.skin_type,
                        additionalInfo.gender,
                        additionalInfo.location
                      ].filter(Boolean).length}/6
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${([
                          profile.full_name,
                          profile.bio,
                          profile.age,
                          profile.skin_type,
                          additionalInfo.gender,
                          additionalInfo.location
                        ].filter(Boolean).length / 6) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => window.location.href = '/scan'}
                >
                  <Activity className="h-4 w-4 mr-2 text-blue-600" />
                  Start New Scan
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => window.location.href = '/achievements'}
                >
                  <Shield className="h-4 w-4 mr-2 text-purple-600" />
                  View Achievements
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-green-50 hover:border-green-300"
                  onClick={() => window.location.href = '/scans'}
                >
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  Scan History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 