# 📄 Pagination Guide

## Overview

API ini menggunakan sistem pagination profesional untuk endpoint `GET /api/projects` dengan fitur:

- Page-based pagination
- Customizable limit
- Search & filter
- Sorting
- Metadata lengkap
- Navigation links (HATEOAS)

## Query Parameters

| Parameter   | Type    | Default         | Max | Description                                                        |
| ----------- | ------- | --------------- | --- | ------------------------------------------------------------------ |
| `page`      | integer | 1               | -   | Halaman yang ingin diakses                                         |
| `limit`     | integer | 10              | 50  | Jumlah item per halaman                                            |
| `featured`  | boolean | -               | -   | Filter project featured saja                                       |
| `search`    | string  | -               | -   | Cari di title, description, atau technologies                      |
| `sortBy`    | string  | order,createdAt | -   | Field untuk sorting (title, createdAt, updatedAt, order, featured) |
| `sortOrder` | string  | desc            | -   | Arah sorting: asc atau desc                                        |

## Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Project Title",
      "descriptionEn": "English description",
      "descriptionId": "Deskripsi Indonesia",
      "image": "https://cloudinary.com/...",
      "technologies": ["React", "Node.js"],
      "demoUrl": "https://demo.com",
      "githubUrl": "https://github.com/...",
      "featured": true,
      "order": 1,
      "createdAt": "2025-11-03T00:00:00.000Z",
      "updatedAt": "2025-11-03T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "links": {
    "self": "http://localhost:5000/api/projects?page=1&limit=10",
    "first": "http://localhost:5000/api/projects?page=1&limit=10",
    "last": "http://localhost:5000/api/projects?page=5&limit=10",
    "next": "http://localhost:5000/api/projects?page=2&limit=10",
    "prev": null
  }
}
```

## Usage Examples

### Basic Pagination

```bash
# Get first page (10 items)
GET /api/projects

# Get page 2 with 20 items
GET /api/projects?page=2&limit=20
```

### Filter Featured Projects

```bash
# Get featured projects only
GET /api/projects?featured=true

# Get featured projects with pagination
GET /api/projects?featured=true&page=1&limit=5
```

### Search

```bash
# Search by keyword
GET /api/projects?search=react

# Search with pagination
GET /api/projects?search=node&page=1&limit=10
```

### Sorting

```bash
# Sort by creation date (newest first)
GET /api/projects?sortBy=createdAt&sortOrder=desc

# Sort by title alphabetically
GET /api/projects?sortBy=title&sortOrder=asc

# Sort by custom order
GET /api/projects?sortBy=order&sortOrder=asc
```

### Combined Queries

```bash
# Featured projects, sorted by order, page 1
GET /api/projects?featured=true&sortBy=order&sortOrder=asc&page=1&limit=5

# Search "react", newest first, page 2
GET /api/projects?search=react&sortBy=createdAt&sortOrder=desc&page=2&limit=10
```

## Frontend Implementation Examples

### JavaScript (Fetch API)

```javascript
async function getProjects(page = 1, limit = 10) {
  const response = await fetch(
    `http://localhost:5000/api/projects?page=${page}&limit=${limit}`
  );
  const data = await response.json();

  console.log("Projects:", data.data);
  console.log("Current Page:", data.pagination.currentPage);
  console.log("Total Pages:", data.pagination.totalPages);
  console.log("Has Next:", data.pagination.hasNextPage);

  return data;
}

// Usage
getProjects(1, 10);
```

### React Example

```jsx
import { useState, useEffect } from "react";

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [page]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/projects?page=${page}&limit=10`
      );
      const data = await response.json();
      setProjects(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="projects">
            {projects.map((project) => (
              <div key={project.id}>
                <h3>{project.title}</h3>
                <img src={project.image} alt={project.title} />
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>

            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Axios Example

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Get projects with pagination
async function getProjects(options = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    featured = null,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const params = new URLSearchParams({
    page,
    limit,
    sortBy,
    sortOrder,
  });

  if (search) params.append("search", search);
  if (featured !== null) params.append("featured", featured);

  const response = await api.get(`/projects?${params}`);
  return response.data;
}

// Usage examples
getProjects({ page: 1, limit: 10 });
getProjects({ search: "react", page: 2 });
getProjects({ featured: true, sortBy: "title", sortOrder: "asc" });
```

## Pagination Metadata Explained

| Field          | Description                                     |
| -------------- | ----------------------------------------------- |
| `currentPage`  | Halaman yang sedang ditampilkan                 |
| `totalPages`   | Total halaman yang tersedia                     |
| `totalItems`   | Total semua item di database                    |
| `itemsPerPage` | Jumlah item per halaman (limit)                 |
| `hasNextPage`  | Boolean: ada halaman selanjutnya?               |
| `hasPrevPage`  | Boolean: ada halaman sebelumnya?                |
| `nextPage`     | Nomor halaman selanjutnya (null jika tidak ada) |
| `prevPage`     | Nomor halaman sebelumnya (null jika tidak ada)  |

## Links (HATEOAS)

API menyediakan links untuk navigasi yang mudah:

| Link    | Description                                      |
| ------- | ------------------------------------------------ |
| `self`  | URL ke halaman saat ini                          |
| `first` | URL ke halaman pertama                           |
| `last`  | URL ke halaman terakhir                          |
| `next`  | URL ke halaman selanjutnya (null jika tidak ada) |
| `prev`  | URL ke halaman sebelumnya (null jika tidak ada)  |

Gunakan links ini untuk navigasi otomatis tanpa perlu membangun URL sendiri!

## Best Practices

1. **Default Values**: Selalu sediakan default value untuk page dan limit
2. **Max Limit**: Jangan request lebih dari 50 items per page
3. **Error Handling**: Handle kasus ketika page > totalPages
4. **Loading States**: Tampilkan loading indicator saat fetching
5. **Cache**: Consider caching untuk mengurangi API calls
6. **URL State**: Simpan pagination state di URL untuk bookmarkable pages

## Common Patterns

### Infinite Scroll

```javascript
let page = 1;
let hasMore = true;

async function loadMore() {
  if (!hasMore) return;

  const data = await getProjects({ page, limit: 10 });
  projects.push(...data.data);
  hasMore = data.pagination.hasNextPage;
  page++;
}
```

### Page Numbers

```javascript
function renderPageNumbers(pagination) {
  const pages = [];
  for (let i = 1; i <= pagination.totalPages; i++) {
    pages.push(
      <button
        key={i}
        className={i === pagination.currentPage ? "active" : ""}
        onClick={() => setPage(i)}
      >
        {i}
      </button>
    );
  }
  return pages;
}
```

### Jump to Page

```javascript
function jumpToPage(pageNumber, totalPages) {
  if (pageNumber < 1 || pageNumber > totalPages) {
    alert("Invalid page number");
    return;
  }
  setPage(pageNumber);
}
```
