const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Cambiar a true para headless
    const page = await browser.newPage();

    // Navegar a la página de ofertas de Mercado Libre México
    let url = 'https://www.mercadolibre.com.mx/ofertas#nav-header';
    let productos = [];

    while (url) {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Esperar a que los productos carguen
        await page.waitForSelector('.promotion-item');

        // Extraer los productos (nombre, precio y precio con descuento)
        const productosPagina = await page.evaluate(() => {
            const items = document.querySelectorAll('.promotion-item');
            let results = [];

            for (let item of items) {
                let nombre = item.querySelector('.promotion-item__title')?.innerText || 'Nombre no disponible';
                let precioRegular = item.querySelector('.promotion-item__oldprice')?.innerText || 'Precio no disponible';
                let precioDescuento = item.querySelector('.promotion-item__price')?.innerText || 'Precio no disponible';

                // Limpiar el formato del precio con descuento
                precioDescuento = precioDescuento.replace(/\s+/g, '').replace(/[^0-9.,]/g, '');

                let descuento = item.querySelector('.promotion-item__discount')?.innerText || 'Sin descuento';
                
                results.push({
                    nombre,
                    precioRegular,
                    precioDescuento,
                    descuento
                });
            }

            return results;
        });

        productos = productos.concat(productosPagina);

        // Verificar si existe un botón para la siguiente página y si está habilitado
        const nextPageButton = await page.evaluate(() => {
            const nextButton = document.querySelector('.andes-pagination__button--next');
            return nextButton && !nextButton.classList.contains('andes-pagination__button--disabled') ? nextButton.querySelector('a')?.href : null;
        });

        url = nextPageButton; // Si no hay más páginas, la URL se convierte en null y se sale del bucle
    }

    console.log(productos); // Mostrar todos los productos extraídos
    await browser.close();
})();
