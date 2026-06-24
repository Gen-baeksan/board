// ── Apps Script 웹앱 URL을 여기에 붙여넣으세요 ───────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyyVb4d_wUmMpITsxUNDyZtlA_aS5tUBMOwZyA8YgJ9L9Oep00l-qTZ1RZZ3RKDyNV0/exec';
// ──────────────────────────────────────────────────────────────

const form      = document.getElementById('post-form');
const postList  = document.getElementById('post-list');
const postCount = document.getElementById('post-count');
const loading   = document.getElementById('loading');
const submitBtn = form.querySelector('button[type="submit"]');

// ── API ───────────────────────────────────────────────────────
async function apiFetch(payload) {
  const res  = await fetch(SCRIPT_URL, {
    method:   payload ? 'POST' : 'GET',
    redirect: 'follow',
    headers:  payload ? { 'Content-Type': 'text/plain' } : undefined,
    body:     payload ? JSON.stringify(payload) : undefined,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

async function fetchPosts() {
  const data = await apiFetch(null);
  return data.posts ?? [];
}

async function createPost(post) {
  return apiFetch({ action: 'create', ...post });
}

async function deletePost(id) {
  return apiFetch({ action: 'delete', id });
}

// ── 렌더링 ────────────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getInitial(name) { return String(name).trim().charAt(0) || '?'; }

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-600',  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-600',        'bg-emerald-100 text-emerald-600',
  'bg-rose-100 text-rose-600',      'bg-amber-100 text-amber-600',
];
function avatarColor(id) { return AVATAR_COLORS[Number(id) % AVATAR_COLORS.length]; }

function renderPosts(posts) {
  loading.classList.add('hidden');
  postList.classList.remove('hidden');
  postList.innerHTML = '';
  postCount.textContent = `${posts.length}개`;

  if (posts.length === 0) {
    postList.innerHTML = `
      <li class="text-center py-16 text-slate-400 text-sm">
        아직 작성된 게시글이 없습니다.
      </li>`;
    return;
  }

  [...posts].reverse().forEach(post => {
    const li = document.createElement('li');
    li.className = 'post-item bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6';
    li.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="shrink-0 w-10 h-10 rounded-full ${avatarColor(post.id)} flex items-center justify-center font-bold text-base select-none">
          ${escapeHtml(getInitial(post.author))}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="text-sm font-semibold text-slate-800">${escapeHtml(post.author)}</span>
            <span class="text-xs text-slate-400">${formatDate(post.date)}</span>
          </div>
          <h3 class="mt-1 text-base font-semibold text-slate-800 leading-snug">${escapeHtml(post.title)}</h3>
          <p class="mt-2 text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">${escapeHtml(post.content)}</p>
          <div class="mt-4 flex justify-end">
            <button
              class="post-delete text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors duration-150 disabled:opacity-40"
              data-id="${post.id}">
              삭제
            </button>
          </div>
        </div>
      </div>`;
    postList.appendChild(li);
  });
}

function showError(msg) {
  loading.classList.add('hidden');
  postList.classList.remove('hidden');
  postList.innerHTML = `
    <li class="text-center py-16 text-rose-400 text-sm">
      ⚠️ ${escapeHtml(msg)}
    </li>`;
}

// ── 이벤트 ────────────────────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = '저장 중…';

  const post = {
    id:      Date.now(),
    author:  document.getElementById('author').value.trim(),
    title:   document.getElementById('title').value.trim(),
    content: document.getElementById('content').value.trim(),
    date:    new Date().toISOString(),
  };

  try {
    await createPost(post);
    form.reset();
    await load();
  } catch (err) {
    alert(`글 작성 중 오류: ${err.message || '잠시 후 다시 시도해 주세요.'}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '＋ 글 작성';
  }
});

postList.addEventListener('click', async e => {
  const btn = e.target.closest('.post-delete');
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = '삭제 중…';

  try {
    await deletePost(Number(btn.dataset.id));
    await load();
  } catch {
    alert('삭제 중 오류가 발생했습니다.');
    btn.disabled = false;
    btn.textContent = '삭제';
  }
});

// ── 초기 로드 ─────────────────────────────────────────────────
async function load() {
  loading.classList.remove('hidden');
  postList.classList.add('hidden');
  try {
    const posts = await fetchPosts();
    renderPosts(posts);
  } catch (err) {
    showError(err.message || '게시글을 불러오지 못했습니다. SCRIPT_URL을 확인해 주세요.');
  }
}

load();
