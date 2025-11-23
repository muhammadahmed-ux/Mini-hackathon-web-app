let users = JSON.parse(localStorage.getItem("users")) || [];
let posts = JSON.parse(localStorage.getItem("posts")) || [];
let loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

window.onload = () => {
    if (loggedUser) showApp();
};

// AUTH
let isSignup = false;

function toggleAuth() {
    isSignup = !isSignup;
    document.getElementById("authTitle").innerText = isSignup ? "Signup" : "Login";
    document.getElementById("authName").style.display = isSignup ? "block" : "none";
    document.getElementById("switchBtn").innerText = isSignup ? "Already have an account? Login" : "Dont have an account? Signup";
}

function handleAuth() {
    let name = document.getElementById("authName").value.trim();
    let email = document.getElementById("authEmail").value.trim();
    let pass = document.getElementById("authPassword").value.trim();

    if (!email || !pass) {
        alert("Please fill required fields!");
        return;
    }

    if (isSignup) {
        if (!name) {
            alert("Please enter your name for signup.");
            return;
        }

        users.push({ name, email, pass });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Signup successful! Now login.");
        toggleAuth();
    } else {
        let user = users.find(u => u.email === email && u.pass === pass);
        if (!user) {
            alert("Invalid email or password");
            return;
        }
        loggedUser = user;
        localStorage.setItem("loggedUser", JSON.stringify(user));
        showApp();
    }
}

function showApp() {
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("welcomeUser").innerText = "Welcome, " + loggedUser.name;
}

function logout() {
    localStorage.removeItem("loggedUser");
    location.reload();
}

/* CREATE POST */
function createPost() {
    let text = document.getElementById("postText").value.trim();
    let img = document.getElementById("postImage").value.trim();

    if (!text && !img) {
        alert("Write something or add an image URL!");
        return;
    }

    let post = {
        id: Date.now(),
        text,
        img,
        user: loggedUser.name,
        likes: 0,
        liked: false,
        showEdit: false,
        time: new Date().toLocaleString()
    };

    posts.unshift(post);
    localStorage.setItem("posts", JSON.stringify(posts));

    document.getElementById("postText").value = "";
    document.getElementById("postImage").value = "";

    renderPosts();
}

/* LIKE */
function toggleLike(id) {
    let p = posts.find(x => x.id === id);
    if (!p) return;

    p.liked = !p.liked;
    p.likes += p.liked ? 1 : -1;

    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}

/* DELETE */
function deletePost(id) {
    if (!confirm("Delete this post?")) return;

    posts = posts.filter(x => x.id !== id);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}

/* EDIT INLINE */
function toggleEdit(id) {
    let p = posts.find(x => x.id === id);
    if (!p) return;

    p.showEdit = !p.showEdit;
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}

function saveEdit(id) {
    let p = posts.find(x => x.id === id);
    if (!p) return;

    let newText = document.getElementById("editText" + id).value.trim();
    let newImg = document.getElementById("editImg" + id).value.trim();

    p.text = newText;
    p.img = newImg;
    p.showEdit = false;

    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}

/* SEARCH + SORT + RENDER */
function renderPosts() {
    let feed = document.getElementById("postFeed");
    let search = document.getElementById("searchInput").value.toLowerCase();
    let sort = document.getElementById("sortSelect").value;

    let filtered = posts.filter(p =>
        p.text.toLowerCase().includes(search)
    );

    if (sort === "latest") filtered.sort((a, b) => b.id - a.id);
    if (sort === "oldest") filtered.sort((a, b) => a.id - b.id);
    if (sort === "likes") filtered.sort((a, b) => b.likes - a.likes);

    feed.innerHTML = "";

    filtered.forEach(p => {
        feed.innerHTML += `
            <div class="post">
                <b>Posted by: ${p.user}</b>
                <p>${p.text}</p>

                ${p.img ? `<img src="${p.img}" alt="Post Image">` : ""}

                <small>${p.time}</small>

                <div class="post-footer">
                    <div class="action-group">
                        <div class="action-btn ${p.liked ? "like-btn-active" : ""}" onclick="toggleLike(${p.id})">
                            <span class="icon">❤️</span><span>${p.likes} Like</span>
                        </div>

                        <div class="action-btn" onclick="toggleEdit(${p.id})">
                            <span class="icon"></span><span>Edit</span>
                        </div>

                        <div class="action-btn" onclick="deletePost(${p.id})">
                            <span class="icon"></span><span><b>Delete</b></span>
                        </div>
                    </div>
                </div>

                ${p.showEdit ? `
                    <div class="edit-box">
                        <textarea id="editText${p.id}" placeholder="Edit text...">${p.text}</textarea>
                        <input id="editImg${p.id}" type="text" placeholder="Image URL (optional)" value="${p.img}">
                        <div class="edit-actions">
                            <button class="btn-primary" onclick="saveEdit(${p.id})">Save</button>
                            <button class="btn-small" onclick="toggleEdit(${p.id})">Cancel</button>
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    });
}

renderPosts();
