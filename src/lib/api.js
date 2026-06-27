/**
 * api.js — All Supabase DB interactions for the Everyday News Blog.
 *
 * Tables:
 *  - articles     : id, title, excerpt, category, date, author_name, author_avatar, image_url, body, featured
 *  - comments     : id, article_id, author, avatar, text, created_at
 *  - likes        : id, article_id, session_id  (one row per like; session_id = random ID in localStorage)
 *  - flash_news   : id, text, active, created_at
 */

import { supabase } from './supabase';

// ─────────────────────────────────────────────
//  SESSION IDENTITY (anonymous per browser tab)
// ─────────────────────────────────────────────
function getSessionId() {
  let sid = localStorage.getItem('newsSessionId');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('newsSessionId', sid);
  }
  return sid;
}

// ─────────────────────────────────────────────
//  ARTICLES
// ─────────────────────────────────────────────

/** Fetch all articles (ordered by newest first) */
export async function fetchArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Fetch a single article by ID (supports prefixed IDs for different tables) */
export async function fetchArticle(id) {
  const idStr = String(id);
  if (idStr.startsWith('ep-')) {
    const numericId = Number(idStr.replace('ep-', ''));
    const { data, error } = await supabase
      .from('editors_picks')
      .select('*')
      .eq('id', numericId)
      .single();
    if (error) throw error;
    return data;
  } else if (idStr.startsWith('tr-')) {
    const numericId = Number(idStr.replace('tr-', ''));
    const { data, error } = await supabase
      .from('trending_articles')
      .select('*')
      .eq('id', numericId)
      .single();
    if (error) throw error;
    return data;
  } else if (idStr.startsWith('story-')) {
    const numericId = Number(idStr.replace('story-', ''));
    const { data, error } = await supabase
      .from('story_articles')
      .select('*')
      .eq('id', numericId)
      .single();
    if (error) throw error;
    return data;
  } else {
    const numericId = Number(id);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', numericId)
      .single();
    if (error) throw error;
    return data;
  }
}

// ─────────────────────────────────────────────
//  COMMENTS
// ─────────────────────────────────────────────

/** Fetch all comments for an article */
export async function fetchComments(articleId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/** Post a new comment */
export async function postComment({ articleId, author, avatar, text, parentId = null }) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ article_id: articleId, author, avatar, text, parent_id: parentId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Like a comment */
export async function likeComment(commentId, currentLikes) {
  const { data, error } = await supabase
    .from('comments')
    .update({ likes_count: (currentLikes || 0) + 1 })
    .eq('id', commentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────
//  LIKES
// ─────────────────────────────────────────────

/** Get total likes count and whether this session liked already */
export async function fetchLikes(articleId) {
  const sessionId = getSessionId();

  const { count, error: countError } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', articleId);

  if (countError) throw countError;

  const { data: myLike, error: likeError } = await supabase
    .from('likes')
    .select('id')
    .eq('article_id', articleId)
    .eq('session_id', sessionId)
    .maybeSingle();

  if (likeError) throw likeError;

  return { count: count ?? 0, hasLiked: !!myLike };
}

/** Toggle like (add if not liked, remove if already liked) */
export async function toggleLike(articleId) {
  const sessionId = getSessionId();

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('article_id', articleId)
    .eq('session_id', sessionId)
    .maybeSingle();

  if (existing) {
    // Remove like
    await supabase.from('likes').delete().eq('id', existing.id);
    return false; // not liked anymore
  } else {
    // Add like
    await supabase.from('likes').insert([{ article_id: articleId, session_id: sessionId }]);
    return true; // now liked
  }
}

// ─────────────────────────────────────────────
//  FLASH NEWS
// ─────────────────────────────────────────────

/** Fetch active flash news items */
export async function fetchFlashNews() {
  const { data, error } = await supabase
    .from('flash_news')
    .select('text')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((r) => r.text);
}

// ═════════════════════════════════════════════
//  ADMIN: ARTICLE CRUD (requires authenticated session)
// ═════════════════════════════════════════════

/** Create a new article */
export async function createArticle({ title, excerpt, body, category, image_url, author_name, author_avatar, author_bio, featured }) {
  const { data, error } = await supabase
    .from('articles')
    .insert([{ title, excerpt, body, category, image_url, author_name, author_avatar, author_bio, featured: featured || false }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update an existing article */
export async function updateArticle(id, updates) {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete an article */
export async function deleteArticle(id) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ═════════════════════════════════════════════
//  ADMIN: FLASH NEWS CRUD
// ═════════════════════════════════════════════

/** Fetch ALL flash news (including inactive, with IDs for admin) */
export async function fetchAllFlashNews() {
  const { data, error } = await supabase
    .from('flash_news')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Create a flash news item */
export async function createFlashNews(text) {
  const { data, error } = await supabase
    .from('flash_news')
    .insert([{ text, active: true }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update a flash news item */
export async function updateFlashNews(id, updates) {
  const { data, error } = await supabase
    .from('flash_news')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete a flash news item */
export async function deleteFlashNews(id) {
  const { error } = await supabase
    .from('flash_news')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ═════════════════════════════════════════════
//  TRENDING ARTICLES (LIVE SECTION) CRUD
// ═════════════════════════════════════════════

/** Fetch active trending articles */
export async function fetchTrendingArticles() {
  const { data, error } = await supabase
    .from('trending_articles')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Fetch ALL trending articles (for admin, including inactive) */
export async function fetchAllTrendingArticles() {
  const { data, error } = await supabase
    .from('trending_articles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Create a trending article */
export async function createTrendingArticle({ title, excerpt, category, image_url, author_name, author_avatar, active }) {
  const { data, error } = await supabase
    .from('trending_articles')
    .insert([{ title, excerpt, category, image_url, author_name, author_avatar, active: active !== undefined ? active : true }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update a trending article */
export async function updateTrendingArticle(id, updates) {
  const { data, error } = await supabase
    .from('trending_articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete a trending article */
export async function deleteTrendingArticle(id) {
  const { error } = await supabase
    .from('trending_articles')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ═════════════════════════════════════════════
//  EDITOR'S PICKS CRUD
// ═════════════════════════════════════════════

/** Fetch active editor's picks */
export async function fetchEditorsPicks() {
  const { data, error } = await supabase
    .from('editors_picks')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Fetch ALL editor's picks (for admin, including inactive) */
export async function fetchAllEditorsPicks() {
  const { data, error } = await supabase
    .from('editors_picks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Create an editor's pick */
export async function createEditorsPick({ title, excerpt, category, image_url, author_name, author_avatar, featured, active }) {
  const { data, error } = await supabase
    .from('editors_picks')
    .insert([{ title, excerpt, category, image_url, author_name, author_avatar, featured: featured || false, active: active !== undefined ? active : true }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update an editor's pick */
export async function updateEditorsPick(id, updates) {
  const { data, error } = await supabase
    .from('editors_picks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete an editor's pick */
export async function deleteEditorsPick(id) {
  const { error } = await supabase
    .from('editors_picks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ═════════════════════════════════════════════
//  STORY ARTICLES CRUD
// ═════════════════════════════════════════════

/** Fetch active story articles */
export async function fetchStoryArticles() {
  const { data, error } = await supabase
    .from('story_articles')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Fetch ALL story articles (for admin, including inactive) */
export async function fetchAllStoryArticles() {
  const { data, error } = await supabase
    .from('story_articles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Create a story article */
export async function createStoryArticle({ title, excerpt, image_url, author_name, author_avatar, author_role, featured, views_count, comments_count, active }) {
  const { data, error } = await supabase
    .from('story_articles')
    .insert([{
      title,
      excerpt,
      image_url,
      author_name,
      author_avatar,
      author_role: author_role || 'Writer',
      featured: featured || false,
      views_count: views_count || '0',
      comments_count: comments_count || '0',
      active: active !== undefined ? active : true
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update a story article */
export async function updateStoryArticle(id, updates) {
  const { data, error } = await supabase
    .from('story_articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete a story article */
export async function deleteStoryArticle(id) {
  const { error } = await supabase
    .from('story_articles')
    .delete()
    .eq('id', id);
  if (error) throw error;
}




