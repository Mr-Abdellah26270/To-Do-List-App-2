
document.addEventListener('DOMContentLoaded', function() {
    const documentationContent = {
        'utility-first': {
            title: 'The Utility-First Approach',
            content: "\n                <p class=\"mb-4\">Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without writing any CSS.</p>\n                <p class=\"mb-4\">Unlike other CSS frameworks like Bootstrap or Foundation, Tailwind doesn't come with pre-designed components. Instead, it provides a set of utility classes that you can use to build your own components.</p>\n                <p>This approach gives you more flexibility and control over the design of your website or application.</p>\n            "
        },
        'utility-classes': {
            title: 'Utility Classes',
            content: "\n                <p class=\"mb-4\">Tailwind provides a comprehensive set of utility classes for styling your HTML elements. These classes cover everything from colors and typography to spacing and layout.</p>\n                <p class=\"mb-4\">For example, you can use the <code class=\"bg-gray-200 p-1 rounded\">text-red-500</code> class to make text red, the <code class=\"bg-gray-200 p-1 rounded\">bg-blue-500</code> class to give an element a blue background, and the <code class=\"bg-gray-200 p-1 rounded\">p-4</code> class to add padding to an element.</p>\n                <p>You can find a complete list of all available utility classes in the <a href=\"https://tailwindcss.com/docs\" class=\"text-blue-500 hover:underline\">official Tailwind CSS documentation</a>.</p>\n            "
        },
        'configuration': {
            title: 'Configuration and Customization',
            content: "\n                <p class=\"mb-4\">You can customize Tailwind's default configuration by creating a <code class=\"bg-gray-200 p-1 rounded\">tailwind.config.js</code> file in your project's root directory.</p>\n                <p class=\"mb-4\">In this file, you can customize everything from the color palette and spacing scale to the fonts and breakpoints.</p>\n                <p>This allows you to create a design system that is unique to your brand and style.</p>\n            "
        },
        'responsive-design': {
            title: 'Responsive Design',
            content: "\n                <p class=\"mb-4\">Tailwind's responsive design features are built right into the utility classes. You can use prefixes like <code class=\"bg-gray-200 p-1 rounded\">sm:</code>, <code class=\"bg-gray-200 p-1 rounded\">md:</code>, <code class=\"bg-gray-200 p-1 rounded\">lg:</code>, and <code class=\"bg-gray-200 p-1 rounded\">xl:</code> to apply different styles at different screen sizes.</p>\n                <p>This makes it easy to create responsive layouts that look great on all devices, from small phones to large desktops.</p>\n            "
        }
    };

    const documentationContainer = document.getElementById('documentation-content');
    const navLinks = document.querySelectorAll('a[href^="#"]');

    function updateContent(hash) {
        const section = hash.substring(1);
        if (documentationContent[section]) {
            documentationContainer.innerHTML = `
                <h2 class="text-3xl font-bold text-gray-800 mb-4">
                    ${documentationContent[section].title}
                </h2>
                ${documentationContent[section].content}
            `;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const hash = this.getAttribute('href');
            history.pushState(null, null, hash);
            updateContent(hash);
        });
    });

    // Initial content
    const initialHash = window.location.hash || '#utility-first';
    history.pushState(null, null, initialHash);
    updateContent(initialHash);
});
