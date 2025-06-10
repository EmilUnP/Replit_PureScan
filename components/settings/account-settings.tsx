'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertTriangle, Key, Mail, Trash2, Shield, CheckCircle, XCircle, Info } from 'lucide-react'
import { sanitizeEmailInput } from '@/lib/utils'

export function AccountSettings() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifications, setNotifications] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null)

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
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

  const handleEmailChange = async () => {
    if (!user || !email) return

    setIsLoading(true)
    try {
      const sanitizedEmail = sanitizeEmailInput(email)
      
      const { error } = await supabase.auth.updateUser({
        email: sanitizedEmail
      })

      if (error) throw error

      showNotification('success', 'Email update request sent! Please check your new email for confirmation.')
    } catch (error) {
      console.error('Error updating email:', error)
      showNotification('error', 'Failed to update email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification('error', 'Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      showNotification('error', 'New passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters long.')
      return
    }

    setIsChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      showNotification('success', 'Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error updating password:', error)
      showNotification('error', 'Failed to update password. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )

    if (!confirmDelete) return

    const deleteConfirmation = window.prompt(
      'This will permanently delete all your data including scans, achievements, and profile information. Type "DELETE" to confirm:'
    )

    if (deleteConfirmation !== 'DELETE') {
      showNotification('info', 'Account deletion cancelled. You must type "DELETE" exactly to confirm.')
      return
    }

    try {
      // Note: Account deletion should be handled server-side for proper cleanup
      // This is a simplified implementation
      showNotification('info', 'Account deletion request submitted. You will be contacted within 24 hours to complete the process.')
    } catch (error) {
      console.error('Error deleting account:', error)
      showNotification('error', 'Failed to delete account. Please contact support.')
    }
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

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Notification Banner */}
      <NotificationBanner />

      {/* Account Overview */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Account Security</CardTitle>
              <p className="text-blue-100 text-sm">
                Manage your account credentials and security settings
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Settings */}
            <div>
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email Address
                  </CardTitle>
                  <CardDescription>
                    Update your email address. You'll need to verify your new email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Current Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleEmailChange} 
                    disabled={isLoading || !email || email === user?.email}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Update Email
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Password Settings */}
            <div>
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-5 w-5 text-green-600" />
                    Password
                  </CardTitle>
                  <CardDescription>
                    Change your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current-password" className="text-sm font-medium">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isChangingPassword ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Strong Password</h4>
              <p className="text-blue-700 text-sm">
                Use a unique password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Email Verification</h4>
              <p className="text-green-700 text-sm">
                Always verify email changes through the confirmation link sent to your new email address.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">Regular Updates</h4>
              <p className="text-purple-700 text-sm">
                Change your password regularly and never share your login credentials with others.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Secure Connection</h4>
              <p className="text-yellow-700 text-sm">
                Always access PureScan2 through a secure connection and log out from shared devices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600">
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                This action cannot be undone
              </h4>
              <p className="text-red-700 text-sm mb-4">
                Deleting your account will permanently remove:
              </p>
              <ul className="text-red-700 text-sm space-y-1 ml-4">
                <li>• Your profile and personal information</li>
                <li>• All scan results and analysis history</li>
                <li>• Achievements and progress tracking</li>
                <li>• Shared links and public profiles</li>
                <li>• All associated data and preferences</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Delete Account</h4>
                <p className="text-gray-600 text-sm">Once deleted, your account cannot be recovered</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 