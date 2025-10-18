
document.addEventListener('DOMContentLoaded', function() {
    const components = [
        {
            name: 'Responsive Card',
            description: 'A responsive card component that adjusts its layout based on the screen size.',
            code: `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src="https://via.placeholder.com/400x200" alt="Placeholder Image" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">Card Title</h2>
                        <p class="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <a href="#" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Learn More</a>
                    </div>
                </div>
            `
        },
        {
            name: 'Modal Dialog',
            description: 'A modal dialog component that can be used to display important information or capture user input.',
            code: `
                <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">Modal Title</h2>
                        <p class="text-gray-600 mb-6">This is a modal dialog. You can put any content you want here.</p>
                        <div class="flex justify-end">
                            <button class="text-gray-500 hover:text-gray-700 mr-4">Cancel</button>
                            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Confirm</button>
                        </div>
                    </div>
                </div>
            `
        },
        {
            name: 'Navigation Bar',
            description: 'A responsive navigation bar with a logo and menu items.',
            code: `
            <nav class="bg-gray-800 p-4">
            <div class="container mx-auto flex justify-between items-center">
              <a href="#" class="text-white text-xl font-bold">Logo</a>
              <ul class="flex space-x-4">
                <li><a href="index.html" class="text-gray-300 hover:text-white">Home</a></li>
                <li><a href="documentation.html" class="text-gray-300 hover:text-white">Documentation</a></li>
                <li><a href="components.html" class="text-gray-300 hover:text-white">Components</a></li>
              </ul>
            </div>
          </nav>
            `
        }
    ];

    const componentsContainer = document.getElementById('components-container');

    components.forEach(component => {
        const componentEl = document.createElement('div');
        componentEl.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-2">${component.name}</h2>
            <p class="text-gray-600 mb-4">${component.description}</p>
            <div class="bg-white rounded-lg shadow-lg p-4 mb-4">
                ${component.code}
            </div>
            <pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"><code>${escapeHtml(component.code)}</code></pre>
        `;
        componentsContainer.appendChild(componentEl);
    });

    function escapeHtml(html) {
        return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
});
