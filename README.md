This application is used for creating invoices, and tracking customer payments and their ledgers, as well as creating
specific reports required by law.

# State
This application was initially written in Kotlin and JavaFX, but is currently being rewritten from scratch to be a React application,
so some functionalities are missing.

| Entity         | Create | Read | Update | Delete | Print |
|----------------|--------|------|--------|--------|-------|
| Invoice        | ✔      | ✔    | ✔      | 🛇     | ✔     |
| Payment        | ✔      | ✔    | ✔      | 🛇     | 🛇    |
| Customer       | ✔      | ✔    | ✔      | ✔      | 🛇    |
| Reports (TODO) | 🛇     |      | 🛇     | 🛇     |       |
| Statistics     | 🛇     |      | 🛇     | 🛇     | 🛇    |

# Mixed language
Since this application is used by one specific Serbian company, there could be remnants of Serbian terms in variables.
I'm actively refactoring the code to translate it to English whenever I encounter mixed-language code. The GUI is still
in Serbian, and the goal is to have it translated to both Serbian and English.

# Architecture
As the application grew, the architecture converged towards using a Repository pattern (as a React global state providing data
and functions for manipulating that data). It uses the Supabase database and auth API to access the data, and that data
is secured with row-level security, providing CRUD access to authenticated users only. The application itself is hosted
on Firebase.

# Printing documents
The documents are rendered as React components (see [InvoiceDocument](https://github.com/aleksandar-stefanovic/bio-light-web/blob/master/src/document/InvoiceDocument.tsx)
for an example). Printing is done using the browser printing dialog, utilizing this CSS rule for the "GUI" part of the app:
```css
@media print {
    .screen-only {
        display: none !important;
    }

    body {
        height: unset;
        width: unset;
    }
}

@media screen {
    .print-only {
        display: none;
    }
}
```
That way, the only thing that is displayed while printing is the document itself.

# Screenshots (will do once the application is translated to English)
