const apiInput = document.getElementById("api-input")
const submitBtn = document.getElementById("submit-btn")

submitBtn.addEventListener("click", () => {
    const userApiKey = apiInput.value;
    chrome.storage.sync.set({
        userApiKey,
    }, () => {
        /* console.log(`The user API Key is set to ${userApiKey}`) */
        apiInput.value = 'The user API Key is set.'
    })
})