import { Navbar } from "../components/navbar.js";

const API_BASE_URL = "http://127.0.0.1:8000";

export function renderPostPage() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Clear previous content

  // Add the navbar
  const navbar = Navbar();
  root.appendChild(navbar);

  // Add main content container
  const postContainer = createPostContainer();
  root.appendChild(postContainer);

  // Add the form
  const form = createPostForm();
  postContainer.appendChild(form);

  // Attach form submit handler
  form.addEventListener("submit", handleFormSubmit);
}

function createPostContainer() {
  const container = document.createElement("div");
  container.id = "post-container";

  const heading = document.createElement("h1");
  heading.textContent = "Welcome to the Post Page!";
  container.appendChild(heading);

  const description = document.createElement("p");
  description.textContent = "This is the Post Page!";
  container.appendChild(description);

  return container;
}

function createPostForm() {
  const form = document.createElement("form");
  form.id = "post-form";
  form.method = "POST";

  // Name field
  const nameLabel = createLabel("first_name", "Name:");
  const nameInput = createInput("text", "first_name", "first_name", true);

  // Age field
  const ageLabel = createLabel("age", "Age:");
  const ageInput = createInput("number", "age", "age", true);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Submit";

  // Append elements to the form
  form.appendChild(nameLabel);
  form.appendChild(nameInput);
  form.appendChild(document.createElement("br"));
  form.appendChild(ageLabel);
  form.appendChild(ageInput);
  form.appendChild(document.createElement("br"));
  form.appendChild(submitButton);

  return form;
}

function createLabel(forId, text) {
  const label = document.createElement("label");
  label.htmlFor = forId;
  label.textContent = text;
  return label;
}

function createInput(type, id, name, required = false) {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.name = name;
  input.required = required;
  return input;
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  const firstName = document.getElementById("first_name").value;
  const age = document.getElementById("age").value;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/post/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: firstName, age }),
    });

    if (response.ok) {
      console.log("Data submitted successfully!");
      // Optionally display a success message to the user
      alert("Submission successful!");
    } else {
      console.error("Error submitting data:", response.status);
      alert("Failed to submit data. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while submitting the form. Please try again.");
  }
}

// import { Navbar } from "../components/navbar.js";

// const API_BASE_URL = "http://127.0.0.1:8000";


// export function renderPostPage() {
//   const root = document.getElementById("root");
//   root.innerHTML = ""; // Clear previous content

//   // Add the navbar
//   const navbar = Navbar();
//   root.appendChild(navbar);

//   // Add main content
//   const postContainer = document.createElement("div");
//   postContainer.id = "post-container";

//   const heading = document.createElement("h1");
//   heading.textContent = "Welcome to the post Page!";
//   postContainer.appendChild(heading);

//   const description = document.createElement("p");
//   description.textContent = "This is the post Page!";
//   postContainer.appendChild(description);

//   const form = document.createElement('form');
// 	form.id = 'myForm';
// 	 // Replace with your actual server-side endpoint
// 	form.method = 'POST';

// 	const nameLabel = document.createElement('label');
// 	nameLabel.htmlFor = 'first_name';
// 	nameLabel.textContent = 'Name:';

// 	const nameInput = document.createElement('input');
// 	nameInput.type = 'text';
// 	nameInput.id = 'first_name';
// 	nameInput.name = 'first_name';
// 	nameInput.required = true;

// 	const ageLabel = document.createElement('label');
// 	ageLabel.htmlFor = 'age';
// 	ageLabel.textContent = 'Age:';

// 	const ageInput = document.createElement('input');
// 	ageInput.type = 'number';
// 	ageInput.id = 'age';
// 	ageInput.name = 'age';
// 	ageInput.required = true;

// 	const submitButton = document.createElement('button');
// 	submitButton.type = 'submit';
// 	submitButton.textContent = 'Submit';

// 	// Append elements to the form
// 	form.appendChild(nameLabel);
// 	form.appendChild(nameInput);
// 	form.appendChild(document.createElement('br'));
// 	form.appendChild(ageLabel);
// 	form.appendChild(ageInput);
// 	form.appendChild(document.createElement('br'));
// 	form.appendChild(submitButton);

// // Append the form to the desired container (e.g., document.body)
// document.body.appendChild(form);

//   root.appendChild(postContainer);


// form.addEventListener('submit', async (event) => {
//   event.preventDefault(); // Prevent default form submission

//   const first_name = document.getElementById('first_name').value;
//   const age = document.getElementById('age').value;

//   try {
//     const response = await fetch(`${API_BASE_URL}/api/users/post/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ first_name, age })
//     });

//     if (response.ok) {
//       console.log('Data submitted successfully!');
//       // Handle successful submission (e.g., display a success message)
//     } else {
//       console.error('Error submitting data:', response.status);
//       // Handle error (e.g., display an error message to the user)
//     }

//   } catch (error) {
//     console.error('Error:', error);
//     // Handle network or other errors
//   }
// });
// }
// const url = `${API_BASE_URL}/api/users/post/`;
// const data = { first_name: 'john cena', age:'30' };
// async function onsubmit() {

// }
// fetch(url, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch((error) => {
//     console.error('Error:', error);
// });

