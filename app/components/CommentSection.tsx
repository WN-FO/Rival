'use client'

import React, { useState, useEffect } from 'react'
import { useSupabase } from './SupabaseProvider'
import { useAuth } from './AuthProvider'
import { useToast } from './ToastProvider'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface CommentSectionProps {
  articleId?: string
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const { supabase } = useSupabase()
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  
  const [comments, setComments] = useState<any[]>([])
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Fetch comments on load
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(id, username, avatar_url)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching comments:', error)
        showToast('error', 'Failed to load comments')
      } else {
        setComments(data || [])
      }
      
      setIsLoading(false)
    }
    
    fetchComments()
    
    // Subscribe to realtime updates
    const commentsChannel = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${articleId}`
        },
        (payload) => {
          // Fetch the user data for the new comment
          supabase
            .from('users')
            .select('id, username, avatar_url')
            .eq('id', payload.new.user_id)
            .single()
            .then(({ data: userData }) => {
              const newComment = {
                ...payload.new,
                user: userData
              }
              
              setComments(prevComments => [newComment, ...prevComments])
            })
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(commentsChannel)
    }
  }, [articleId, supabase, showToast])
  
  // Handle comment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showToast('error', 'You must be logged in to comment')
      return
    }
    
    if (!comment.trim()) {
      showToast('error', 'Comment cannot be empty')
      return
    }
    
    setIsSubmitting(true)
    
    const { error } = await supabase
      .from('comments')
      .insert({
        article_id: articleId,
        user_id: user.id,
        content: comment.trim()
      })
    
    setIsSubmitting(false)
    
    if (error) {
      console.error('Error posting comment:', error)
      showToast('error', 'Failed to post comment')
    } else {
      setComment('')
      showToast('success', 'Comment posted successfully')
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          placeholder="Write your comment..."
          rows={3}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Post Comment
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                  {comment.user?.avatar_url ? (
                    <Image
                      src={comment.user.avatar_url}
                      alt={comment.user.username || 'User'}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {(comment.user?.username || 'User').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    {comment.user?.username || 'Anonymous'}
                  </h3>
                  <span className="ml-2 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection 