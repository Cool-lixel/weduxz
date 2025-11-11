document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen Global ---
    const loginScreen = document.getElementById('login-screen');
    const mainControlPanel = document.getElementById('main-control-panel');
    const masterBotTokenInput = document.getElementById('masterBotTokenInput');
    const botTokenLoginForm = document.getElementById('botTokenLoginForm');
    const loginStatus = document.getElementById('loginStatus');
    const logoutButton = document.getElementById('logoutButton');
    const currentBotUsernameDisplay = document.getElementById('currentBotUsernameDisplay');

    let masterBotToken = sessionStorage.getItem('masterBotToken');

    // --- Elemen Panel Utama ---
    const displayBotId = document.getElementById('displayBotId');
    const displayBotUsername = document.getElementById('displayBotUsername');
    const displayBotName = document.getElementById('displayBotName');

    const changeBotNameForm = document.getElementById('changeBotNameForm');
    const newBotNameInput = document.getElementById('newBotName');
    const changeNameStatus = document.getElementById('changeNameStatus');

    const changeBotBioForm = document.getElementById('changeBotBioForm');
    const newBotBioInput = document.getElementById('newBotBio');
    const newBotShortBioInput = document.getElementById('newBotShortBio');
    const changeBioStatus = document.getElementById('changeBioStatus');

    const sendMessageForm = document.getElementById('sendMessageForm');
    const targetIdInput = document.getElementById('targetId');
    const sendMessageStatus = document.getElementById('sendMessageStatus');

    const webhookUrlDisplay = document.getElementById('webhookUrlDisplay');
    const refreshUsersButton = document.getElementById('refreshUsersButton');
    const userList = document.getElementById('userList');

    const messageTypeRadios = document.querySelectorAll('input[name="messageType"]');
    const textMessageGroup = document.getElementById('textMessageGroup');
    const photoMessageGroup = document.getElementById('photoMessageGroup');
    const videoMessageGroup = document.getElementById('videoMessageGroup');
    const messageTextInput = document.getElementById('messageText');
    const photoUrlInput = document.getElementById('photoUrl');
    const photoCaptionInput = document.getElementById('photoCaption');
    const videoUrlInput = document.getElementById('videoUrl');
    const videoCaptionInput = document.getElementById('videoCaption');

    const addLungzzForm = document.getElementById('addLungzzForm');
    const lungzzNameInput = document.getElementById('lungzzName');
    const lungzzContentInput = document.getElementById('lungzzContent');
    const lungzzListElement = document.getElementById('lungzzList');

    const selectLungzzText = document.getElementById('selectLungzzText');
    const useLungzzTextButton = document.getElementById('useLungzzTextButton');
    const selectLungzzPhotoCaption = document.getElementById('selectLungzzPhotoCaption');
    const useLungzzPhotoCaptionButton = document.getElementById('useLungzzPhotoCaptionButton');
    const selectLungzzVideoCaption = document.getElementById('selectLungzzVideoCaption');
    const useLungzzVideoCaptionButton = document.getElementById('useLungzzVideoCaptionButton');

    // --- Fungsi Bantuan untuk Panggilan API Telegram Langsung ---
    async function callTelegramApi(apiMethod, payload, statusElement) {
        if (!masterBotToken) {
            if (statusElement) {
                statusElement.className = 'status-message error';
                statusElement.textContent = 'Token bot tidak ditemukan. Harap login ulang.';
            }
            showLoginScreen();
            return null;
        }

        if (statusElement) {
            statusElement.className = 'status-message';
            statusElement.textContent = 'Memproses...';
        }

        try {
            const telegramApiUrl = `https://api.telegram.org/bot${masterBotToken}/${apiMethod}`;
            const response = await fetch(telegramApiUrl, {
                method: 'POST', // Mayoritas API Bot Telegram menggunakan POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.description || 'Terjadi kesalahan saat memanggil API Telegram.');
            }

            if (statusElement) {
                statusElement.className = 'status-message success';
                statusElement.textContent = 'Berhasil! ' + (data.description || data.message || '');
            }
            return data;
        } catch (error) {
            console.error('Error saat memanggil API Telegram:', error);
            if (statusElement) {
                statusElement.className = 'status-message error';
                statusElement.textContent = 'Gagal: ' + error.message;
            }
            return null;
        }
    }

    // --- Fungsi Manajemen Tampilan ---
    function showLoginScreen() {
        loginScreen.style.display = 'flex';
        mainControlPanel.classList.remove('active');
        mainControlPanel.style.display = 'none';
        masterBotToken = null;
        sessionStorage.removeItem('masterBotToken');
        currentBotUsernameDisplay.textContent = '';
    }

    async function showMainControlPanel() {
        loginScreen.style.display = 'none';
        mainControlPanel.style.display = 'block';
        setTimeout(() => mainControlPanel.classList.add('active'), 10);

        // Langsung panggil API Telegram untuk info bot
        const result = await callTelegramApi('getMe', {}, null);
        if (result && result.result) {
            displayBotId.textContent = result.result.id;
            displayBotUsername.textContent = result.result.username;
            displayBotName.textContent = result.result.first_name;
            currentBotUsernameDisplay.textContent = `(@${result.result.username})`;
        } else {
            displayBotId.textContent = 'N/A';
            displayBotUsername.textContent = 'N/A';
            displayBotName.textContent = 'N/A';
            currentBotUsernameDisplay.textContent = '(Gagal memuat info bot)';
        }

        // Karena tidak ada server-side webhook, ini hanya placeholder
        webhookUrlDisplay.textContent = `Tidak ada server-side webhook aktif.`;

        renderLungzzList();
        renderUserList();
    }

    // --- Event Listener Login ---
    botTokenLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = masterBotTokenInput.value.trim();
        if (!token) {
            loginStatus.className = 'status-message error';
            loginStatus.textContent = 'Token bot tidak boleh kosong.';
            return;
        }

        loginStatus.className = 'status-message';
        loginStatus.textContent = 'Memverifikasi token...';
        try {
            const telegramApiUrl = `https://api.telegram.org/bot${token}/getMe`;
            const apiRes = await fetch(telegramApiUrl);
            const data = await apiRes.json();

            if (!apiRes.ok || !data.ok) {
                throw new Error(data.description || 'Token tidak valid.');
            }

            masterBotToken = token;
            sessionStorage.setItem('masterBotToken', token);
            loginStatus.className = 'status-message success';
            loginStatus.textContent = 'Token berhasil diverifikasi!';
            setTimeout(showMainControlPanel, 500);
        } catch (error) {
            loginStatus.className = 'status-message error';
            loginStatus.textContent = 'Gagal verifikasi token: ' + error.message;
        }
    });

    // --- Event Listener Logout ---
    logoutButton.addEventListener('click', showLoginScreen);

    // --- Toggle Section Content ---
    document.querySelectorAll('.toggle-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.toggle('active');
                button.textContent = targetContent.classList.contains('active') ? '▲' : '▼';
            }
        });
    });

    // --- Logika Tampilan Tipe Pesan ---
    messageTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            textMessageGroup.classList.remove('active');
            photoMessageGroup.classList.remove('active');
            videoMessageGroup.classList.remove('active');

            messageTextInput.removeAttribute('required');
            photoUrlInput.removeAttribute('required');
            videoUrlInput.removeAttribute('required');
            messageTextInput.value = '';
            photoUrlInput.value = '';
            photoCaptionInput.value = '';
            videoUrlInput.value = '';
            videoCaptionInput.value = '';

            switch (radio.value) {
                case 'text':
                    textMessageGroup.classList.add('active');
                    messageTextInput.setAttribute('required', 'required');
                    break;
                case 'photo':
                    photoMessageGroup.classList.add('active');
                    photoUrlInput.setAttribute('required', 'required');
                    break;
                case 'video':
                    videoMessageGroup.classList.add('active');
                    videoUrlInput.setAttribute('required', 'required');
                    break;
            }
        });
    });

    // --- Logika LUNGZZ (Menggunakan localStorage) ---
    let lungzzCollection = JSON.parse(localStorage.getItem('lungzzCollection')) || [];

    function saveLungzz() {
        localStorage.setItem('lungzzCollection', JSON.stringify(lungzzCollection));
    }

    function renderLungzzList() {
        lungzzListElement.innerHTML = '';
        selectLungzzText.innerHTML = '<option value="">-- Pilih Teks Cepat --</option>';
        selectLungzzPhotoCaption.innerHTML = '<option value="">-- Pilih Teks Cepat --</option>';
        selectLungzzVideoCaption.innerHTML = '<option value="">-- Pilih Teks Cepat --</option>';

        lungzzCollection.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'lungzz-list-item';
            li.innerHTML = `
                <span><strong>${item.name}:</strong> ${item.content.substring(0, 70)}${item.content.length > 70 ? '...' : ''}</span>
                <button data-index="${index}">Hapus</button>
            `;
            lungzzListElement.appendChild(li);

            const optionText = document.createElement('option');
            optionText.value = item.content;
            optionText.textContent = item.name;
            selectLungzzText.appendChild(optionText);

            const optionCaptionPhoto = document.createElement('option');
            optionCaptionPhoto.value = item.content;
            optionCaptionPhoto.textContent = item.name;
            selectLungzzPhotoCaption.appendChild(optionCaptionPhoto);

            const optionCaptionVideo = document.createElement('option');
            optionCaptionVideo.value = item.content;
            optionCaptionVideo.textContent = item.name;
            selectLungzzVideoCaption.appendChild(optionCaptionVideo);
        });
    }

    addLungzzForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = lungzzNameInput.value.trim();
        const content = lungzzContentInput.value.trim();

        if (name && content) {
            lungzzCollection.push({ name, content });
            saveLungzz();
            renderLungzzList();
            lungzzNameInput.value = '';
            lungzzContentInput.value = '';
        }
    });

    lungzzListElement.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const index = parseInt(e.target.dataset.index);
            if (!isNaN(index)) {
                lungzzCollection.splice(index, 1);
                saveLungzz();
                renderLungzzList();
            }
        }
    });

    useLungzzTextButton.addEventListener('click', () => {
        const selectedContent = selectLungzzText.value;
        if (selectedContent) {
            messageTextInput.value = selectedContent;
        }
    });

    useLungzzPhotoCaptionButton.addEventListener('click', () => {
        const selectedContent = selectLungzzPhotoCaption.value;
        if (selectedContent) {
            photoCaptionInput.value = selectedContent;
        }
    });

    useLungzzVideoCaptionButton.addEventListener('click', () => {
        const selectedContent = selectLungzzVideoCaption.value;
        if (selectedContent) {
            videoCaptionInput.value = selectedContent;
        }
    });

    // --- Logika Manajemen Pengguna (Simulasi database.json dengan localStorage) ---
    let collectedUsers = JSON.parse(localStorage.getItem('collectedUsers')) || [];

    function saveUsers() {
        localStorage.setItem('collectedUsers', JSON.stringify(collectedUsers));
    }

    function renderUserList() {
        userList.innerHTML = '';
        if (collectedUsers.length > 0) {
            collectedUsers.forEach(user => {
                const li = document.createElement('li');
                li.innerHTML = `ID: ${user.id} | Username: <strong>${user.username || 'N/A'}</strong> | Nama: ${user.first_name || 'N/A'}
                                <button data-id="${user.id}" class="remove-user-button">Hapus</button>`;
                userList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Belum ada pengguna terkumpul di brankas lokalmu.';
            userList.appendChild(li);
        }
    }

    const addUserForm = document.createElement('form');
    addUserForm.innerHTML = `
        <input type="text" id="manualUserId" placeholder="Tambah ID Pengguna Manual" required>
        <input type="text" id="manualUsername" placeholder="Username (opsional)">
        <input type="text" id="manualFirstName" placeholder="Nama Depan (opsional)">
        <button type="submit">Tambah Pengguna</button>
    `;
    document.getElementById('collected-users-section').querySelector('.section-content').prepend(addUserForm);

    addUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('manualUserId').value.trim());
        const username = document.getElementById('manualUsername').value.trim() || null;
        const firstName = document.getElementById('manualFirstName').value.trim() || null;

        if (!isNaN(id) && !collectedUsers.some(u => u.id === id)) {
            collectedUsers.push({ id, username, first_name: firstName, added_at: new Date().toISOString() });
            saveUsers();
            renderUserList();
            document.getElementById('manualUserId').value = '';
            document.getElementById('manualUsername').value = '';
            document.getElementById('manualFirstName').value = '';
        } else if (isNaN(id)) {
            alert('ID Pengguna harus berupa angka!');
        } else {
            alert('Pengguna dengan ID ini sudah ada!');
        }
    });

    userList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-user-button')) {
            const idToRemove = parseInt(e.target.dataset.id);
            collectedUsers = collectedUsers.filter(user => user.id !== idToRemove);
            saveUsers();
            renderUserList();
        }
    });

    refreshUsersButton.addEventListener('click', () => {
        renderUserList();
        const statusElement = document.createElement('p');
        statusElement.className = 'status-message success';
        statusElement.textContent = 'Daftar pengguna lokal dimuat ulang.';
        userList.parentNode.insertBefore(statusElement, userList.nextSibling);
        setTimeout(() => statusElement.remove(), 3000);
    });

    // --- Event Listeners untuk fungsi bot (sekarang memanggil callTelegramApi langsung) ---
    changeBotNameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = newBotNameInput.value.trim();
        if (!newName) return;
        await callTelegramApi('setMyName', { name: newName }, changeNameStatus);
    });

    changeBotBioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newBio = newBotBioInput.value.trim();
        const newShortBio = newBotShortBioInput.value.trim();
        if (!newBio && !newShortBio) return;

        // Telegram API for bio changes is setMyDescription and setMyShortDescription
        // We'll call them sequentially if both are provided
        let successCount = 0;
        let errorMessages = [];

        if (newBio) {
            const res = await callTelegramApi('setMyDescription', { description: newBio }, null); // Handle status separately
            if (res) successCount++; else errorMessages.push('deskripsi panjang');
        }
        if (newShortBio) {
            const res = await callTelegramApi('setMyShortDescription', { short_description: newShortBio }, null); // Handle status separately
            if (res) successCount++; else errorMessages.push('deskripsi singkat');
        }

        if (successCount > 0 && errorMessages.length === 0) {
            changeBioStatus.className = 'status-message success';
            changeBioStatus.textContent = `Bio bot berhasil diubah.`;
        } else if (successCount > 0 && errorMessages.length > 0) {
            changeBioStatus.className = 'status-message error';
            changeBioStatus.textContent = `Sebagian bio berhasil diubah. Gagal mengubah: ${errorMessages.join(', ')}.`;
        } else {
            changeBioStatus.className = 'status-message error';
            changeBioStatus.textContent = `Gagal mengubah bio bot.`;
        }
    });

    sendMessageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const targetId = targetIdInput.value.trim();
        const selectedMessageType = document.querySelector('input[name="messageType"]:checked').value;
        let payload = { chat_id: targetId };
        let apiMethod = '';

        if (!targetId) {
            sendMessageStatus.className = 'status-message error';
            sendMessageStatus.textContent = 'ID target diperlukan.';
            return;
        }

        switch (selectedMessageType) {
            case 'text':
                const text = messageTextInput.value.trim();
                if (!text) {
                    sendMessageStatus.className = 'status-message error';
                    sendMessageStatus.textContent = 'Pesan teks tidak boleh kosong.';
                    return;
                }
                apiMethod = 'sendMessage';
                payload.text = text;
                break;
            case 'photo':
                const photoUrl = photoUrlInput.value.trim();
                const photoCaption = photoCaptionInput.value.trim();
                if (!photoUrl) {
                    sendMessageStatus.className = 'status-message error';
                    sendMessageStatus.textContent = 'URL gambar tidak boleh kosong.';
                    return;
                }
                apiMethod = 'sendPhoto';
                payload.photo = photoUrl;
                if (photoCaption) payload.caption = photoCaption;
                break;
            case 'video':
                const videoUrl = videoUrlInput.value.trim();
                const videoCaption = videoCaptionInput.value.trim();
                if (!videoUrl) {
                    sendMessageStatus.className = 'status-message error';
    
