
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'


const CAT_ICONS = { UPDATE: '📢', REQUEST: '🙏', OFFER: '🤝', QUESTION: '❓', ALERT: '🚨', GRATITUDE: '💜' }
const CAT_COLORS = { UPDATE: 'bg-blue-50 text-blue-600 border-blue-200', REQUEST: 'bg-amber-50 text-amber-600 border-amber-200', OFFER: 'bg-emerald-50 text-emerald-600 border-emerald-200', QUESTION: 'bg-purple-50 text-purple-600 border-purple-200', ALERT: 'bg-red-50 text-red-600 border-red-200', GRATITUDE: 'bg-pink-50 text-pink-600 border-pink-200' }
const CATEGORIES = ['UPDATE', 'REQUEST', 'OFFER', 'QUESTION', 'ALERT', 'GRATITUDE']

export default function CommunityPage() {
  // Getuser session
  const { data: session } = useSession()


  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState('UPDATE')
  const [commentText, setCommentText] = useState({})
  const [showComments, setShowComments] = useState({})

  // Fetchposts 
  useEffect(function () {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const response = await fetch('/api/community')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
    setLoading(false)
  }

  // Createpost
  async function createPost(event) {
    event.preventDefault()
    let postData = { title: formTitle, content: formContent, category: formCategory }

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
      if (response.ok) {
        toast.success('Post published!')
        setShowForm(false)
        setFormTitle('')
        setFormContent('')
        setFormCategory('UPDATE')
        fetchPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  // comment
  async function addComment(postId) {
    let text = commentText[postId] || ''
    if (text.trim() === '') {
      return
    }

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentOnPostId: postId, content: text }),
      })
      if (response.ok) {
        let updatedComments = { ...commentText }
        updatedComments[postId] = ''
        setCommentText(updatedComments)
        fetchPosts()
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  // Updatecomment 
  function updateCommentText(postId, text) {
    let updated = { ...commentText }
    updated[postId] = text
    setCommentText(updated)
  }

  // Togglecomments
  function toggleComments(postId) {
    let updated = { ...showComments }
    updated[postId] = !updated[postId]
    setShowComments(updated)
  }

  function handleCommentKeyDown(event, postId) {
    if (event.key === 'Enter') {
      event.preventDefault()
      addComment(postId)
    }
  }
  //CATEGORYFILTERKORA
  let filtered = []
  for (let i = 0; i < posts.length; i++) {
    if (filter === 'ALL' || posts[i].category === filter) {
      filtered.push(posts[i])
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">💬 Community Board</h1>
            <p className="text-slate-500 text-sm mt-1">Share updates, requests, and connect with your community.</p>
          </div>
          <button onClick={function () { setShowForm(!showForm) }} className="btn-primary">{showForm ? '✕ Close' : '+ New Post'}</button>
        </div>


        {showForm && (
          <form onSubmit={createPost} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800">New Post</h2>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Title *</label>
              <input value={formTitle} onChange={function (e) { setFormTitle(e.target.value) }} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(function (cat) {
                  let isActive = (formCategory === cat)
                  let catStyle = 'bg-white/50 text-slate-500 border border-white/60'
                  if (isActive) {
                    catStyle = 'bg-teal-100 text-teal-700 border border-teal-300'
                  }
                  return (
                    <button key={cat} type="button" onClick={function () { setFormCategory(cat) }}
                      className={'px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ' + catStyle}>
                      {CAT_ICONS[cat]} {cat}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Content *</label>
              <textarea value={formContent} onChange={function (e) { setFormContent(e.target.value) }} className="input min-h-[100px] resize-none" required />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={function () { setShowForm(false) }} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">📢 Publish</button>
            </div>
          </form>
        )}


        <div className="flex flex-wrap gap-2">
          <button onClick={function () { setFilter('ALL') }}
            className={'px-4 py-2 rounded-xl text-sm font-medium transition-all ' + (filter === 'ALL' ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm' : 'bg-white/50 text-slate-500 border border-white/60')}>
            All
          </button>
          {CATEGORIES.map(function (cat) {
            let isActive = (filter === cat)
            let catBtnStyle = 'bg-white/50 text-slate-500 border border-white/60'
            if (isActive) {
              catBtnStyle = CAT_COLORS[cat] + ' shadow-sm'
            }
            return (
              <button key={cat} onClick={function () { setFilter(cat) }}
                className={'px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ' + catBtnStyle}>
                {CAT_ICONS[cat]} {cat}
              </button>
            )
          })}
        </div>


        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(function (post) {

              let authorInitial = ''
              if (post.author && post.author.name && post.author.name.length > 0) {
                authorInitial = post.author.name[0]
              }


              let commentCount = 0
              if (post._count && post._count.comments) {
                commentCount = post._count.comments
              }


              let commentsVisible = showComments[post.id] || false


              let pinnedStyle = ''
              if (post.isPinned) {
                pinnedStyle = ' border-l-4 border-l-amber-400'
              }

              return (
                <div key={post.id} className={'card' + pinnedStyle}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{authorInitial}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-slate-700">{post.author.name}</span>
                        <span className="text-[10px] text-slate-400">{post.author.role}</span>
                        <span className={'badge text-[10px] ' + CAT_COLORS[post.category]}>{CAT_ICONS[post.category]} {post.category}</span>
                        {post.isPinned && <span className="text-[10px] text-amber-500 font-medium">📌 Pinned</span>}
                      </div>
                      <h3 className="font-display font-semibold text-slate-800 mb-1">{post.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span>{formatDate(post.createdAt)}</span>
                        <button onClick={function () { toggleComments(post.id) }} className="text-teal-600 hover:text-teal-500 font-medium">
                          💬 {commentCount} comments {commentsVisible ? '▲' : '▼'}
                        </button>
                      </div>

                      {/* Comments section */}
                      {commentsVisible && (
                        <div className="mt-3 space-y-2 animate-slide-down">
                          {post.comments.map(function (comment) {
                            let commentAuthorInitial = ''
                            if (comment.author && comment.author.name && comment.author.name.length > 0) {
                              commentAuthorInitial = comment.author.name[0]
                            }
                            return (
                              <div key={comment.id} className="flex gap-2 p-3 rounded-xl bg-white/40 border border-white/50">
                                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700 flex-shrink-0">{commentAuthorInitial}</div>
                                <div>
                                  <p className="text-xs"><span className="font-semibold text-slate-700">{comment.author.name}</span> <span className="text-slate-400">{comment.author.role}</span></p>
                                  <p className="text-sm text-slate-600 mt-0.5">{comment.content}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">{formatDate(comment.createdAt)}</p>
                                </div>
                              </div>
                            )
                          })}
                          {session && (
                            <div className="flex gap-2 mt-2">
                              <input
                                value={commentText[post.id] || ''}
                                onChange={function (e) { updateCommentText(post.id, e.target.value) }}
                                className="input flex-1 py-2 text-sm"
                                placeholder="Write a comment..."
                                onKeyDown={function (e) { handleCommentKeyDown(e, post.id) }}
                              />
                              <button onClick={function () { addComment(post.id) }} className="btn-primary text-xs px-4">Reply</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
