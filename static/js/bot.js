const GEMINI_API_KEY = 'AIzaSyBGXCqSHW33EjLoREtsMyNMX6q2GHMHOP0';
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        let currentState = 'initial';
        let selectedCategory = null;
        let filters = {};

        // Initial bot message
        window.onload = () => {
            addBotMessage("Hi! I'm Career Compass, your AI assistant for finding opportunities. What would you like to explore today?\n\n1. Jobs\n2. Scholarships\n3. Internships");
        };

        function addMessage(content, isUser = false) {
            const messagesDiv = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.textContent = content;
            
            messageDiv.appendChild(messageContent);
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function addBotMessage(content) {
            addMessage(content, false);
        }

        function addUserMessage(content) {
            addMessage(content, true);
        }

        function showTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.innerHTML = '<span></span><span></span><span></span>';
            document.getElementById('chatMessages').appendChild(indicator);
        }

        function hideTypingIndicator() {
            const indicators = document.getElementsByClassName('typing-indicator');
            for (let indicator of indicators) {
                indicator.remove();
            }
        }

        function createFilterOptions(category) {
            const filterContainer = document.createElement('div');
            filterContainer.className = 'filter-container active';

            const filters = {
                jobs: [
                    { type: 'select', label: 'Industry', options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Other'] },
                    { type: 'select', label: 'Experience Level', options: ['Entry Level', 'Mid Level', 'Senior Level'] },
                    { type: 'input', label: 'Location', placeholder: 'Enter location' }
                ],
                scholarships: [
                    { type: 'select', label: 'Study Level', options: ['Undergraduate', 'Graduate', 'PhD'] },
                    { type: 'select', label: 'Field of Study', options: ['STEM', 'Arts', 'Business', 'Medicine', 'Other'] },
                    { type: 'input', label: 'Country', placeholder: 'Enter country' }
                ],
                internships: [
                    { type: 'select', label: 'Duration', options: ['Summer', '3-6 months', '6-12 months'] },
                    { type: 'select', label: 'Field', options: ['Software Development', 'Marketing', 'Research', 'Business'] },
                    { type: 'input', label: 'Location', placeholder: 'Enter location' }
                ]
            };

            const categoryFilters = filters[category.toLowerCase()];
            categoryFilters.forEach(filter => {
                const filterGroup = document.createElement('div');
                filterGroup.className = 'filter-group';

                const label = document.createElement('label');
                label.textContent = filter.label;
                filterGroup.appendChild(label);

                if (filter.type === 'select') {
                    const select = document.createElement('select');
                    filter.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.toLowerCase().replace(' ', '-');
                        optionElement.textContent = option;
                        select.appendChild(optionElement);
                    });
                    filterGroup.appendChild(select);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = filter.placeholder;
                    filterGroup.appendChild(input);
                }

                filterContainer.appendChild(filterGroup);
            });

            return filterContainer;
        }

        async function sendMessage() {
            const userInput = document.getElementById('userInput');
            const message = userInput.value.trim();
            
            if (!message) return;
            
            addUserMessage(message);
            userInput.value = '';
            showTypingIndicator();

            try {
                if (currentState === 'initial') {
                    handleInitialState(message);
                } else {
                    const response = await getGeminiResponse(message);
                    hideTypingIndicator();
                    addBotMessage(response);
                }
            } catch (error) {
                console.error('Error:', error);
                hideTypingIndicator();
                addBotMessage("I apologize, but I encountered an error. Please try again.");
            }
        }

        function handleInitialState(message) {
            const categories = ['jobs', 'scholarships', 'internships'];
            const userChoice = message.toLowerCase();
            
            if (userChoice.includes('1') || userChoice.includes('job')) {
                selectedCategory = 'jobs';
            } else if (userChoice.includes('2') || userChoice.includes('scholarship')) {
                selectedCategory = 'scholarships';
            } else if (userChoice.includes('3') || userChoice.includes('internship')) {
                selectedCategory = 'internships';
            }

            if (selectedCategory) {
                currentState = 'filtering';
                hideTypingIndicator();
                const filterOptions = createFilterOptions(selectedCategory);
                document.getElementById('chatMessages').appendChild(filterOptions);
                addBotMessage(`Great! Let's find some ${selectedCategory} for you. Please set your preferences using the filters above, then tell me what specific requirements you have.`);
            } else {
                hideTypingIndicator();
                addBotMessage("I didn't quite catch that. Please choose one of the following:\n1. Jobs\n2. Scholarships\n3. Internships");
            }
        }

        async function getGeminiResponse(message) {
            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `User is looking for ${selectedCategory}. Their message: ${message}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }

        // Event listener for Enter key
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function formatMessage(text) {
            // Format headings (lines ending with ':')
            text = text.replace(/^(.+):$/gm, '<h2>$1</h2>');
            
            // Format subheadings (lines starting with '***')
            text = text.replace(/\*\*\*([^*]+)\*\*/g, '<h3>$1</h3>');
            
            // Format bold text (between single asterisks)
            text = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
            
            // Format lists
            text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
            text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
            
            // Format paragraphs
            text = text.split('\n\n').map(para => 
                para.trim().startsWith('<') ? para : `<p>${para}</p>`
            ).join('');
            
            return text;
        }

        async function getGeminiResponse(message) {
            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `User is looking for ${selectedCategory}. Format your response with appropriate headings using ':' at the end of heading lines, use '***' for important questions/subheadings, and '*' for emphasis. Their message: ${message}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            let messageText = data.candidates[0].content.parts[0].text;
            return formatMessage(messageText);
        }

        function addBotMessage(content) {
            const messagesDiv = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot-message';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.innerHTML = content;
            
            messageDiv.appendChild(messageContent);
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }