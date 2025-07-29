const mysql = require('mysql2');

// Replace these values with your MySQL database configuration
const dbConfig = {
  host: '172.20.0.7',
  user: 'root',
  password: 'xyz123',
  database: 'lamprinakis_eshop',
};

const products = [
    {
      "name": "Dell Vostro 3000",
      "price": 1032.50,
      "image": "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/vostro-notebooks/15-3510/media-gallery/archive/dv3510nt_cnb_05000ff090_bk.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=606&qlt=100,1&resMode=sharp2&size=606,402&chrss=full",
      "brand": "Dell",
      "category": "laptops",
      "stock": 10,
      "product_code":"5f039b4ef00"
    },
    {
      "name": "Lenovo Thinkpad E14 Gen 3 (14\" AMD)",
      "price": 1509.75,
      "image": "https://a.scdn.gr/images/sku_main_images/057667/57667059/xlarge_20241127102146_lenovo_thinkpad_e14_gen_6_amd_14_ips_fhd_ryzen_5_7535hs_16gb_512gb_ssd_w11_pro_us_keyboard.jpeg",
      "brand": "Lenovo",
      "category": "laptops",
      "stock": 5,
      "product_code":"08389ddsa32"
    },
    {
      "name": "Lenovo Thinkpad L14",
      "price": 2021.25,
      "image": "https://lenovostore.gr/media/products/heroes/262-94-LVPNL14AL/262-94-LVPNL14AL.jpg",
      "brand": "Lenovo",
      "category": "laptops",
      "stock": 0,
      "product_code":"39b4ef0058a1"
    },
    {
      "name": "Lenovo Thinkpad X1 Carbon",
      "price": 1256.80,
      "image": "https://p1-ofp.static.pub/medias/bWFzdGVyfHJvb3R8ODQ4NDd8aW1hZ2UvcG5nfGgyMi9oOGYvMTA2NzQ1ODc3Mjk5NTAucG5nfDQzODYxOTc5ODA0MWJhZTQyYThjOTAzZjE0NDI2NWVjYjY5MjE3MGFiMWEzODhlN2UyMGUwNGZhMWRmOTJmNzg/lenovo-laptop-thinkpad-x1-carbon-gen8-subseries-hero.png",
      "brand": "Lenovo",
      "category": "laptops",
      "stock": 8,
      "product_code":"58a1d652f13d"
    },
    {
      "name": "Apple Macbook Pro M2",
      "price": 1675.20,
      "image": "https://images.macrumors.com/t/MwgTEggiztXrvIN2l8bZny1f93M=/1600x/article-new/2013/09/2023-macbook-pro-transparent.png",
      "brand": "Apple",
      "category": "laptops",
      "stock": 0,
      "product_code":"f6b45d89e"
    },
    {
      "name": "Apple Macbook Air M2",
      "price": 926.75,
      "image": "https://images.macrumors.com/t/AI0UfpE0Io0I3yfew8TtFUxyi3s=/800x0/smart/article-new/2013/09/macbook-air-m2-roundup-header.png?lossy",
      "brand": "Apple",
      "category": "laptops",
      "stock": 12,
      "product_code":"f0058a1d65"
    }
  ]

async function insertProducts() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const insertQuery = 'INSERT INTO products (name, price, image, brand, category, stock, product_code) VALUES (?, ?, ?, ?, ?, ?, ?)';

    for (const product of products) {
      const { name, price, image, brand, category, stock, product_code } = product;

      try {
        await connection.execute(insertQuery, [name, price, image, brand, category, stock, product_code]);
        console.log(`Product "${name}" inserted successfully.`);
      } catch (error) {
        console.error(`Error inserting product "${name}": ${error.message}`);
      }
    }

    connection.end();
    console.log('All products inserted into the database.');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
}

insertProducts();