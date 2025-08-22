import pic from "../../public/acessts/download (47).jpg";

const products = [
  {
    name: "محلول أكتسيل ميكرو (1 لتر)",
    category: "كيميائيات مبيدات", // Fixed spelling: كيمائيات → كيميائيات
    price: 210.00,
    status: true,
    img: pic
  },
  {
    name: "محلول أكتسيل ميكرو (5 لتر)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 1020.00,
    status: true,
    img: pic
  },
  {
    name: "ميثام sodium n-  (1 لتر)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 260.00,
    status: true,
    img: pic
  },
  {
    name: "أمينواسيد بلص (5 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 1050.00,
    status: true,
    img: pic
  },
  {
    name: "هيوميك أسيد بودر (1 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 130.00,
    status: true,
    img: pic
  },
  {
    name: "سوبر فوسفات أحادي (1 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 65.00,
    status: true,
    img: pic
  },
  {
    name: "كالسيوم بورون (250 جم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 55.00,
    status: true,
    img: pic
  },
  {
    name: "بوتاسيوم سلفات (1 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 175.00,
    status: true,
    img: pic
  },
  {
    name: "هيوميك أسيد سائل (1 لتر)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 95.00,
    status: false,
    img: pic
  },
  {
    name: "بوتاسيوم سلفات (5 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 800.00,
    status: true,
    img: pic
  },
  {
    name: "كالسيوم نترات (1 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 130.00,
    status: true,
    img: pic
  },
  {
    name: "هيوميك أسيد (1 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 200.00,
    status: "نفذ المخزون",
    img: pic
  },
  {
    name: "مغنيسيوم سلفات (1 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 90.00,
    status: false,
    img: pic
  },
  {
    name: "مغنيسيوم سلفات (25 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 1200.00,
    status: true,
    img: pic
  },
  {
    name: "بوتاسيوم سلفات (5 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 850.00,
    status: true,
    img: pic
  },
  {
    name: "بوتاسيوم فوسفات (1 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 270.00,
    status: true,
    img: pic
  },
  {
    name: "بوتاسيوم فوسفات (5 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 1200.00,
    status: true,
    img: pic
  },
  {
    name: "هيوميك أسيد بودر (500 جم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 95.00,
    status: true,
    img: pic
  },
  {
    name: "هيوميك أسيد بودر (1 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 160.00,
    status: true,
    img: pic
  },
  {
    name: "زنك كبريتات (1 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 150.00,
    status: true,
    img: pic
  },
  {
    name: "بوتاسيوم سلفات (5 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 800.00,
    status: true,
    img: pic
  },
  {
    name: "كالسيوم نترات (1 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 130.00,
    status: true,
    img: pic
  },
  {
    name: "هيوميك أسيد (1 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 200.00,
    status: "نفذ المخزون",
    img: pic
  },
  {
    name: "مغنيسيوم سلفات (1 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 90.00,
    status: false,
    img: pic
  },
  {
    name: "مغنيسيوم سلفات (25 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 1200.00,
    status: true,
    img: pic
  },
  {
    name: "بوتاسيوم سلفات (5 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 850.00,
    status: true,
    img: pic
  },
  {
    name: "بوتاسيوم فوسفات (1 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 270.00,
    status: true,
    img: pic
  },
  {
    name: "بوتاسيوم فوسفات (5 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 1200.00,
    status: true,
    img: pic
  },
  {
    name: "هيوميك أسيد بودر (500 جم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 95.00,
    status: true,
    img: pic
  },
  {
    name: "هيوميك أسيد بودر (1 كجم)",
    category: "كيميائيات الخضراء", // Fixed spelling
    price: 160.00,
    status: true,
    img: pic
  },
  {
    name: "زنك كبريتات (1 كجم)",
    category: "كيميائيات مبيدات", // Fixed spelling
    price: 150.00,
    status: true,
    img: pic
  }
];

function getByFirstLetter(letter) {
  if (letter === 'كل') {
    return products;
  }
  return products.filter(p => p.name.trim().startsWith(letter));
}

// Fixed function to handle array of category IDs
function getByCategory(categoryIds) {
  console.log('Selected category IDs:', categoryIds);
  
  // If no categories selected, return all products
  if (!categoryIds || categoryIds.length === 0) {
    return products;
  }
  
  // Map category IDs to Arabic labels
  const categoryMap = {
    'general': 'كيميائيات عامة',
    'cleaners': 'كيميائيات منظفات',
    'pesticides': 'كيميائيات مبيدات',
    'paints': 'كيميائيات رابعة',
    'cosmetics': 'كيميائيات مستحضرات التجميل',
    'water-treatment': 'كيميائيات معالجة المياه',
    'construction': 'كيميائيات مواد البناء',
    'vegetables': 'كيميائيات الخضراء',
    'lab-equipment': 'أجهزة مستلزمات المعامل'
  };
  
  // Convert category IDs to Arabic labels
  const categoryLabels = categoryIds.map(id => categoryMap[id]).filter(Boolean);
  
  console.log('Mapped to labels:', categoryLabels);
  
  // Filter products by matching category labels
  return products.filter(product => categoryLabels.includes(product.category));
}

export { products, getByFirstLetter, getByCategory };