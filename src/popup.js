const apiUrl = "https://api.openai.com/v1/engines/text-davinci-003/completions";

chrome.storage.sync.get(["userApiKey"], (res) => {
    const apiKey = res.userApiKey ?? "???"
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        console.log(apiKey);
        if (tab.url.startsWith("https://github.com/")) {
          const repoUrl = tab.url.replace("https://github.com/", "https://api.github.com/repos/");
          const requestOptions = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          };
          fetch(repoUrl, requestOptions)
            .then((response) => response.json())
            .then((data) => {
              const description = data.description || "";
              const language = data.language || "";
              const stars = data.stargazers_count || 0;
              const forks = data.forks_count || 0;
              const readmeUrl = `${repoUrl}/readme`;
              fetch(readmeUrl, requestOptions)
                .then((response) => response.json())
                .then((data) => {
                  const readme = atob(data.content);
                  const prompt = `I want you to act like a Software Engineer with 15 years of experience. Summarize the purpose, features, and architecture of the following repository in detail. Explain the point of entry, transfer of control, the functionality of each file, latest version and updates in that version: ${description}.`;
                  const requestBody = {
                    prompt,
                    max_tokens: 2048,
                    temperature: 0,
                    n: 1,
                  };
                  const requestOptions = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(requestBody),
                  };
                  fetch(apiUrl, requestOptions)
                    .then((response) => response.json())
                    .then((data) => {
                      const summary = data.choices[0].text.trim();
                      const result = `${summary} The main programming language used in this repository is ${language}. It has ${stars} stars and ${forks} forks.`;
                      document.getElementById("summary").innerText = result;
                    })
                    .catch((error) => {
                      console.log(error);
                      document.getElementById("summary").innerText = "An error occurred while summarizing the repository.";
                    });
                })
                .catch((error) => {
                  console.log(error);
                  document.getElementById("summary").innerText = "An error occurred while fetching the README file.";
                });
            })
            .catch((error) => {
              console.log(error);
              document.getElementById("summary").innerText = "An error occurred while fetching the repository information.";
            });
        } else {
          document.getElementById("summary").innerText = "Please open a GitHub repository to summarize.";
        }
      })
});

