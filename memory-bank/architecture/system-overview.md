# System Architecture Overview

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React Components)                                 │
│  ├── Search Interface (SearchBar, Filters, Results)         │
│  ├── Product Display (ProductCard, Pagination)              │
│  └── UI Components (Radix UI + Tailwind CSS)                │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                   │
│  ├── API Routes (/api/search, /api/suggestions)             │
│  └── Server Actions (getSearchMetadata)                     │
├─────────────────────────────────────────────────────────────┤
│  Business Logic                                              │
│  ├── Search Engine (Fuse.js + Custom Sorting)               │
│  ├── CSV Processor (Hybrid OOP/Functional)                  │
│  └── Data Transformations                                    │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ├── CSV File (products.csv - 870K+ products)               │
│  └── Pre-built Search Index (search-index.json)             │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### **Frontend**

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **State Management**: React hooks + TanStack Query
- **Icons**: Lucide React

### **Backend**

- **Runtime**: Node.js (Next.js API Routes)
- **Search**: Fuse.js (fuzzy search library)
- **Data Processing**: Custom hybrid CSV processor
- **Caching**: TanStack Query (client-side)

### **Data**

- **Source**: CSV file with Shopify product data
- **Processing**: Chunked streaming approach
- **Storage**: Pre-built JSON index for performance
- **Size**: 5,954 products after processing

## 🎯 Key Design Decisions

### **1. Hybrid Backend Approach**

- **API Routes**: Real-time search and suggestions
- **Server Actions**: One-time metadata loading
- **Rationale**: Optimal performance for different use cases

### **2. Pre-built Search Index**

- **Approach**: CSV → JSON transformation at build time
- **Benefit**: Eliminates first-request latency
- **Trade-off**: Larger bundle size vs. runtime performance

### **3. Fuse.js for Search**

- **Configuration**: Weighted fields, 0.4 threshold
- **Fields**: title (0.4), description (0.3), vendor (0.2), productType (0.1)
- **Features**: Fuzzy matching, relevance scoring, highlighting

### **4. Component Architecture**

- **Pattern**: Composition over inheritance
- **Structure**: Feature-based organization
- **Reusability**: Shared UI components with Radix UI

## 📊 Performance Characteristics

- **Search Speed**: <100ms average response time
- **Memory Usage**: ~50MB constant (chunked processing)
- **Bundle Size**: Optimized with Next.js tree shaking
- **Caching**: 5-minute stale time, 10-minute garbage collection

## 🔄 Data Flow

1. **CSV Processing**: products.csv → hybrid processor → search-index.json
2. **Search Request**: User input → debounced query → API route → Fuse.js → filtered results
3. **Caching**: TanStack Query caches by search parameters
4. **Pagination**: Cached per page for instant navigation
