document.addEventListener('DOMContentLoaded', function () {
    const vendors = [
        {
            id: 'vendor1',
            name: 'Innovate LLC',
            address: '123 Tech Park, Silicon Valley, CA 94000',
            taxID: '12-3456789',
            bankInfo: 'Bank of Tech, Account: 1234567890'
        },
        {
            id: 'vendor2',
            name: 'Creative Solutions Ltd.',
            address: '456 Design Ave, Arts District, NY 10001',
            taxID: '98-7654321',
            bankInfo: 'Design Bank, Account: 0987654321'
        }
    ];

    const vendorSelect = document.getElementById('vendor-select');
    const vendorName = document.getElementById('vendor-name');
    const vendorAddress = document.getElementById('vendor-address');

    function populateVendors() {
        vendors.forEach(vendor => {
            const option = document.createElement('option');
            option.value = vendor.id;
            option.textContent = vendor.name;
            vendorSelect.appendChild(option);
        });
        // Set initial vendor
        updateVendorDetails(vendors[0]);
    }

    function updateVendorDetails(vendor) {
        vendorName.textContent = vendor.name;
        vendorAddress.textContent = vendor.address;
    }

    vendorSelect.addEventListener('change', (event) => {
        const selectedVendorId = event.target.value;
        const selectedVendor = vendors.find(vendor => vendor.id === selectedVendorId);
        if (selectedVendor) {
            updateVendorDetails(selectedVendor);
        }
    });

    const addItemBtn = document.getElementById('add-item-btn');
    const invoiceItems = document.getElementById('invoice-items');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const grandTotalEl = document.getElementById('grand-total');

    function updateGrandTotals() {
        let subtotal = 0;
        const rows = invoiceItems.querySelectorAll('tr');
        rows.forEach(row => {
            const totalSpan = row.querySelector('.total');
            if (totalSpan) {
                subtotal += parseFloat(totalSpan.textContent) || 0;
            }
        });

        const tax = subtotal * 0.10;
        const grandTotal = subtotal + tax;

        subtotalEl.textContent = subtotal.toFixed(2);
        taxEl.textContent = tax.toFixed(2);
        grandTotalEl.textContent = grandTotal.toFixed(2);
    }

    function calculateRowTotal(row) {
        const quantityInput = row.querySelector('.quantity');
        const unitPriceInput = row.querySelector('.unit-price');
        const totalSpan = row.querySelector('.total');

        const quantity = parseFloat(quantityInput.value) || 0;
        const unitPrice = parseFloat(unitPriceInput.value) || 0;
        const total = quantity * unitPrice;
        totalSpan.textContent = total.toFixed(2);
        updateGrandTotals();
    }

    function addLineItem() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="form-control" placeholder="Item Description"></td>
            <td><input type="number" class="form-control quantity" placeholder="1" value="1"></td>
            <td><input type="number" class="form-control unit-price" placeholder="0.00" value="0"></td>
            <td><span class="total">0.00</span></td>
            <td><button class="btn btn-danger btn-sm remove-item-btn">Remove</button></td>
        `;
        invoiceItems.appendChild(row);

        row.querySelectorAll('.quantity, .unit-price').forEach(input => {
            input.addEventListener('input', () => calculateRowTotal(row));
        });

        const removeBtn = row.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    row.remove();
                    updateGrandTotals();
                    Swal.fire(
                        'Deleted!',
                        'The line item has been deleted.',
                        'success'
                    );
                }
            });
        });

        calculateRowTotal(row);
    }

    addItemBtn.addEventListener('click', addLineItem);


    const templateSelect = document.getElementById('template-select');
    const invoicePaper = document.querySelector('.invoice-paper');

    function switchTemplate() {
        const selectedTemplate = templateSelect.value;
        invoicePaper.classList.remove('template-classic', 'template-modern', 'template-minimal', 'template-colored-rows', 'template-sidebar');
        invoicePaper.classList.add(selectedTemplate);
    }

    templateSelect.addEventListener('change', switchTemplate);

    const generatePdfBtn = document.getElementById('generate-pdf-btn');

    function generatePDF() {
        Swal.fire({
            title: 'Please wait',
            text: 'Generating invoice...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const { jsPDF } = window.jspdf;
        const invoice = document.querySelector('.invoice-paper');
        const clientName = document.getElementById('client-name').value || 'client';
        const date = new Date().toISOString().slice(0, 10);
        const filename = `Invoice-${clientName}-${date}.pdf`;

        document.body.classList.add('print-ready');

        html2canvas(invoice).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(filename);

            document.body.classList.remove('print-ready');

            Swal.fire({
                title: 'Success!',
                text: 'Invoice successfully generated!',
                icon: 'success'
            });
        });
    }

    generatePdfBtn.addEventListener('click', generatePDF);

    populateVendors();
});
