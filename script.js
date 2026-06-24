const form = document.getElementById('post-form');
const postList = document.getElementById('post-list');
const postCount = document.getElementById('post-count');

const SAMPLE_POSTS = [
  { id: 1, author: '김민준', title: '게시판 오픈을 환영합니다!', content: '안녕하세요, 학생 게시판이 열렸습니다. 자유롭게 글을 남겨 주세요!', date: '2026-06-24T09:00:00.000Z' },
  { id: 2, author: '이서연', title: '오늘 수업 공지', content: '오늘 3교시 수업은 강의실 변경이 있습니다. 101호 → 203호로 이동해 주세요.', date: '2026-06-24T10:30:00.000Z' },
];

let posts = JSON.parse(localStorage.getItem('posts') || 'null') ?? SAMPLE_POSTS;

function savePosts() {
  localStorage.setItem('posts', JSON.stringify(posts));
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getInitial(name) {
  return name.trim().charAt(0) || '?';
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-600',
  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-600',
  'bg-emerald-100 text-emerald-600',
  'bg-rose-100 text-rose-600',
  'bg-amber-100 text-amber-600',
];

function avatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function renderPosts() {
  postList.innerHTML = '';
  postCount.textContent = `${posts.length}개`;

  if (posts.length === 0) {
    postList.innerHTML = `
      <li class="text-center py-16 text-slate-400 text-sm">
        아직 작성된 게시글이 없습니다.
      </li>`;
    return;
  }

  [...posts].reverse().forEach((post, i) => {
    const colorClass = avatarColor(post.id);
    const li = document.createElement('li');
    li.className = 'post-item bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6';
    li.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-bold text-base select-none">
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
              class="post-delete text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors duration-150"
              data-id="${post.id}">
              삭제
            </button>
          </div>
        </div>
      </div>`;
    postList.appendChild(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const post = {
    id: Date.now(),
    author: document.getElementById('author').value.trim(),
    title: document.getElementById('title').value.trim(),
    content: document.getElementById('content').value.trim(),
    date: new Date().toISOString(),
  };
  posts.push(post);
  savePosts();
  renderPosts();
  form.reset();
});

postList.addEventListener('click', e => {
  const btn = e.target.closest('.post-delete');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  posts = posts.filter(p => p.id !== id);
  savePosts();
  renderPosts();
});

renderPosts();
