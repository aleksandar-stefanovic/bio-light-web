This application is used for creating invoices, and tracking customer payments and their ledgers, as well as creating
specific reports required by law.

# State
This application was written in Kotlin and JavaFX, but is currently being rewritten from scratch to be a React application,
so some functionalities are missing.

| Entity         | Create | Read | Update | Delete | Print |
|----------------|--------|------|--------|--------|-------|
| Invoice        | ✔      | ✔    |        | 🛇     | ✔     |
| Payment        |        | ✔    |        | 🛇     | 🛇    |
| Customer       |        | ✔    |        |        | 🛇    |
| Reports (TODO) |        |      |        | 🛇     |       |

# Mixed language
Since this application is used by one specific Serbian company, there could be remnants of Serbian terms in variables.
I'm actively refactoring the code to translate it to English whenever I encounter mixed-language code. The GUI is still
in Serbian, and the goal is to have it translated to both Serbian and English.

# Architecture
As the application grew, the architecture converged towards using a Repository pattern (as a React global state providing data
and functions for manipulating that data). It uses the Supabase database and auth API to access the data, and that data
is secured with row-level security, providing CRUD access to authenticated users only. The application itself is hosted
on Firebase.

# Screenshots (TODO)
