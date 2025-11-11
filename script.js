document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen yang sudah ada ---
    const getBotInfoForm = document.getElementById('getBotInfoForm');
    const botTokenInfoInput = document.getElementById('botTokenInfo');
    const displayBotId = document.getElementById('displayBotId');
    const displayBotUsername = document.getElementById('displayBotUsername');
    const displayBotName = document.getElementById('displayBotName');

    const changeBotNameForm = document.getElementById('changeBotNameForm');
    const botTokenNameInput = document.getElementById('botTokenName');
    const newBotNameInput = document.getElementById('newBotName');
    const changeNameStatus = document.getElementById('changeNameStatus');

    const changeBotBioForm = document.getElementById('changeBotBioForm');
    const botTokenBioInput = document.getElementById('botTokenBio');
    const newBotBioInput = document.getElementById('newBotBio');
    const newBotShortBioInput = document.getElementById('newBotShortBio');
    const changeBioStatus = document.getElementById('changeBioStatus');

    const sendMessageForm = document.getElementById('sendMessageForm');
    const botTokenMessageInput = document.getElementById('botTokenMessage');
    const targetIdInput = document.getElementById('targetId');
    const sendMessageStatus = document.getElementById('sendMessageStatus');

    const webhookUrlDisplay = document.getElementById('webhookUrlDisplay');
    const refreshUsersButton = document.getElementById('refreshUsersButton');
    const userList = document.getElementById('userList');

    // --- Elemen untuk media ---
    const messageTypeRadios = document.querySelectorAll('input[name="messageType"]');
    const textMessageGroup = document.getElementById('textMessageGroup');
    const photoMessageGroup = document.getElementById('photoMessageGroup');
    const videoMessageGroup = document.getElementById('videoMessageGroup');
    const messageTextInput = document.getElementById('messageText');
    const photoUrlInput = document.getElementById('photoUrl');
    const photoCaptionInput = document.getElementById('photoCaption');
    const videoUrlInput = document.getElementById('videoUrl');
    const videoCaptionInput = document.getElementById('videoCaption');

    // --- Elemen baru untuk LUNGZZ ---
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


    // Display the webhook URL for the user
    webhookUrlDisplay.textContent = `${window.location.origin}/api/webhook`;

    // --- Fungsi Bantuan untuk Panggilan API ---
    async function callApi(endpoint, method, body, statusElement) {
        if (statusElement) statusElement.textContent = 'Memproses...';
        if (statusElement) statusElement.style.color = '#e0e0e0'; // Reset warna

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Terjadi kesalahan');
            }
            if (statusElement) {
                statusElement.style.color = '#4CAF50';
                statusElement.textContent = 'Berhasil! ' + (data.message || '');
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            if (statusElement) {
                statusElement.style.color = '#f44336'; // Red for error
                statusElement.textContent = 'Gagal: ' + error.message;
            }
            return null;
        }
    }

    // --- Logika Tampilan Tipe Pesan (sudah ada) ---
    messageTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            textMessageGroup.classList.remove('active');
            photoMessageGroup.classList.remove('active');
            videoMessageGroup.classList.remove('active');

            messageTextInput.removeAttribute('required');
            photoUrlInput.removeAttribute('required');
            videoUrlInput.removeAttribute('required');

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

    // --- Logika LUNGZZ (Baru!) ---
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
            // Render list for management
            const li = document.createElement('li');
            li.className = 'lungzz-list-item';
            li.innerHTML = `
                <span><strong>${item.name}:</strong> ${item.content.substring(0, 50)}${item.content.length > 50 ? '...' : ''}</span>
                <button data-index="${index}">Hapus</button>
            `;
            lungzzListElement.appendChild(li);

            // Populate dropdowns
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


    // --- Event Listeners yang sudah ada (tidak berubah) ---

    getBotInfoForm.addEventListener('submit', async (e) => { /* ... */ });
    changeBotNameForm.addEventListener('submit', async (e) => { /* ... */ });
    changeBotBioForm.addEventListener('submit', async (e) => { /* ... */ });
    sendMessageForm.addEventListener('submit', async (e) => { /* ... */ });
    refreshUsersButton.addEventListener('click', async () => { /* ... */ });

    // --- Panggil render LUNGZZ saat DOM dimuat ---
    renderLungzzList();
    // Initial load of users (optional, can be triggered by button only)
    refreshUsersButton.click();
});
