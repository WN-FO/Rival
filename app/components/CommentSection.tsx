'use client'

import React, { useState, useEffect } from 'react'
import { useSupabase } from './SupabaseProvider'
import { useAuth } from './AuthProvider'
import { useToast } from './ToastProvider'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface CommentSectionProps {
  articleId: string
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { supabase } = useSupabase()
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
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
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showToast('error', 'You must be logged in to comment')
      return
    }
    
    if (!commentText.trim()) {
      showToast('error', 'Comment cannot be empty')
      return
    }
    
    setIsSubmitting(true)
    
    const { error } = await supabase
      .from('comments')
      .insert({
        article_id: articleId,
        user_id: user.id,
        content: commentText.trim()
      })
    
    setIsSubmitting(false)
    
    if (error) {
      console.error('Error posting comment:', error)
      showToast('error', 'Failed to post comment')
    } else {
      setCommentText('')
      showToast('success', 'Comment posted successfully')
    }
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments</h2>
      
      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div>
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Add your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300"
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-md p-4 mb-8 text-center">
          <p className="text-gray-700">
            <a href="/login" className="text-indigo-600 font-medium hover:text-indigo-500">
              Sign in
            </a>{' '}
            to leave a comment
          </p>
        </div>
      )}
      
      {/* Comments list */}
      <div className="space-y-6">
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