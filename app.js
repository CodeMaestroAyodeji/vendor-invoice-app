document.addEventListener('DOMContentLoaded', function () {
    let vendors = [];

    function loadVendorsFromStorage() {
        const storedVendors = localStorage.getItem('invoiceAppVendors');
        if (storedVendors) {
            vendors = JSON.parse(storedVendors);
        } else {
            vendors = [
                {
                    id: 'vendor1',
                    name: 'Innovate LLC',
                    address: '123 Tech Park, Silicon Valley, CA 94000',
                    contactPerson: 'John Doe',
                    phone: '123-456-7890',
                    email: 'contact@innovatellc.com',
                    tin: '12-3456789',
                    bankDetails: 'Bank of Tech, Account: 1234567890',
                    logoPath: null
                },
                {
                    id: 'vendor2',
                    name: 'Creative Solutions Ltd.',
                    address: '456 Design Ave, Arts District, NY 10001',
                    contactPerson: 'Jane Smith',
                    phone: '098-765-4321',
                    email: 'hello@creativesolutions.com',
                    tin: '98-7654321',
                    bankDetails: 'Design Bank, Account: 0987654321',
                    logoPath: null
                }
            ];
        }
    }

    function saveVendorsToStorage() {
        localStorage.setItem('invoiceAppVendors', JSON.stringify(vendors));
    }
    
    loadVendorsFromStorage();

    const vendorSelect = document.getElementById('vendor-select');
    const vendorName = document.getElementById('vendor-name');
    const vendorAddress = document.getElementById('vendor-address');
    const vendorContact = document.getElementById('vendor-contact');
    const vendorPhone = document.getElementById('vendor-phone');
    const vendorEmail = document.getElementById('vendor-email');
    const vendorTin = document.getElementById('vendor-tin');
    const vendorBank = document.getElementById('vendor-bank');
    const displayVendorTin = document.getElementById('display-vendor-tin');
    const addVendorModal = new bootstrap.Modal(document.getElementById('addVendorModal'));


    function populateVendors() {
        vendorSelect.innerHTML = '';
        vendors.forEach(vendor => {
            const option = document.createElement('option');
            option.value = vendor.id;
            option.textContent = vendor.name;
            vendorSelect.appendChild(option);
        });
    }
    
    function addNewVendor() {
        const newVendorName = document.getElementById('new-vendor-name').value;
        if (!newVendorName) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Vendor name is required!',
            });
            return;
        }

        const newVendor = {
            id: `vendor${vendors.length + 1}`,
            name: newVendorName,
            contactPerson: document.getElementById('new-vendor-contact').value,
            address: document.getElementById('new-vendor-address').value,
            phone: document.getElementById('new-vendor-phone').value,
            email: document.getElementById('new-vendor-email').value,
            tin: document.getElementById('new-vendor-tin').value,
            bankDetails: document.getElementById('new-vendor-bank').value,
            logoPath: null
        };

        vendors.push(newVendor);
        saveVendorsToStorage();
        populateVendors();
        vendorSelect.value = newVendor.id;
        updateVendorDetails(newVendor);
        addVendorModal.hide();
        document.getElementById('add-vendor-form').reset();

        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'New vendor added successfully!',
        });
    }

    const saveVendorBtn = document.getElementById('save-vendor-btn');
    saveVendorBtn.addEventListener('click', addNewVendor);


    function updateVendorDetails(vendor) {
        if (!vendor) return;
        vendorName.textContent = vendor.name;
        vendorAddress.textContent = vendor.address;
        vendorPhone.textContent = vendor.phone;
        vendorEmail.textContent = vendor.email;
        displayVendorTin.textContent = vendor.tin;

        vendorContact.textContent = vendor.contactPerson ? `Attn: ${vendor.contactPerson}` : '';
        vendorBank.textContent = vendor.bankDetails ? `Bank: ${vendor.bankDetails}` : '';

        [vendorContact, vendorBank].forEach(el => {
            el.style.display = el.textContent ? 'block' : 'none';
        });

        const vendorLogo = document.getElementById('vendor-logo');
        if (vendor.logoPath) {
            vendorLogo.src = vendor.logoPath;
            vendorLogo.style.display = 'block';
        } else {
            vendorLogo.src = autoGenerateLogo(vendor.name);
        }

        const year = new Date().getFullYear();
        const vendorInitials = getVendorInitials(vendor.name);
        invoiceNumberPrefix.textContent = `INV/${vendorInitials}/${year}/`;
        updateInvoiceNumber();
        
        preparedByName.textContent = vendor.contactPerson;
    }

    function autoGenerateLogo(vendorName) {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const context = canvas.getContext('2d');

        context.fillStyle = '#004D99';
        context.fillRect(0, 0, 100, 100);

        context.fillStyle = 'white';
        context.font = 'bold 40px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const initials = vendorName.split(' ').map(n => n[0]).join('').substring(0, 3);
        context.fillText(initials, 50, 50);

        return canvas.toDataURL();
    }
    
    function getVendorInitials(vendorName) {
        return vendorName.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
    }

    const logoUpload = document.getElementById('logo-upload');

    function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const selectedVendorId = vendorSelect.value;
                const selectedVendor = vendors.find(vendor => vendor.id === selectedVendorId);
                if (selectedVendor) {
                    selectedVendor.logoPath = e.target.result;
                    updateVendorDetails(selectedVendor);
                    saveVendorsToStorage();
                }
            };
            reader.readAsDataURL(file);
        }
    }

    logoUpload.addEventListener('change', handleLogoUpload);

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
    const discountEl = document.getElementById('discount');
    const taxEl = document.getElementById('tax');
    const grandTotalEl = document.getElementById('grand-total');
    const taxAmountInput = document.getElementById('tax-amount');
    const discountAmountInput = document.getElementById('discount-amount');
    const taxLabel = document.getElementById('tax-label');

    let manualTax = false;

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    }

    function updateGrandTotals() {
        let subtotal = 0;
        const rows = invoiceItems.querySelectorAll('tr');
        rows.forEach(row => {
            const totalSpan = row.querySelector('.total');
            if (totalSpan) {
                subtotal += parseFloat(totalSpan.textContent.replace(/[₦,]/g, '')) || 0;
            }
        });

        const discountAmount = parseFloat(discountAmountInput.value.replace(/[₦,]/g, '')) || 0;
        const subtotalAfterDiscount = subtotal - discountAmount;
        
        let taxAmount;
        if (manualTax) {
            taxAmount = parseFloat(taxAmountInput.value.replace(/[₦,]/g, '')) || 0;
        } else {
            taxAmount = subtotalAfterDiscount * 0.075;
            taxAmountInput.value = taxAmount.toFixed(2);
        }
        taxLabel.textContent = `Tax (7.5%)`;

        const grandTotal = subtotalAfterDiscount + taxAmount;

        subtotalEl.textContent = formatCurrency(subtotal);
        discountEl.textContent = formatCurrency(discountAmount);
        taxEl.textContent = formatCurrency(taxAmount);
        grandTotalEl.textContent = formatCurrency(grandTotal);
    }

    taxAmountInput.addEventListener('input', () => {
        manualTax = true;
        updateGrandTotals();
    });
    discountAmountInput.addEventListener('input', updateGrandTotals);

    function calculateRowTotal(row) {
        const quantityInput = row.querySelector('.quantity');
        const unitPriceInput = row.querySelector('.unit-price');
        const totalSpan = row.querySelector('.total');

        const quantity = parseFloat(quantityInput.value) || 0;
        const unitPrice = parseFloat(unitPriceInput.value) || 0;
        const total = quantity * unitPrice;
        totalSpan.textContent = formatCurrency(total);
        updateGrandTotals();
    }

    function addLineItem() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="form-control" placeholder="Item Description"></td>
            <td><input type="number" class="form-control quantity" placeholder="1" value="1"></td>
            <td><input type="number" class="form-control unit-price" placeholder="0.00" value="0"></td>
            <td><span class="total">${formatCurrency(0)}</span></td>
            <td><button class="btn btn-danger btn-sm remove-item-btn no-print">Remove</button></td>
        `;
        invoiceItems.appendChild(row);

        const unitPriceInput = row.querySelector('.unit-price');
        unitPriceInput.addEventListener('focus', () => {
            unitPriceInput.value = unitPriceInput.value.replace(/[₦,]/g, '');
        });
        unitPriceInput.addEventListener('blur', () => {
            unitPriceInput.value = formatCurrency(parseFloat(unitPriceInput.value) || 0);
        });

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
        const clientName = document.getElementById('customer-name').value || 'client';
        const date = new Date().toISOString().slice(0, 10);
        const filename = `Invoice-${clientName}-${date}.pdf`;

        const inputs = invoice.querySelectorAll('input');
        const spans = [];
        inputs.forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            span.className = input.className;
            span.style.display = 'inline-block';
            input.parentNode.insertBefore(span, input);
            spans.push(span);
            input.style.display = 'none';
        });

        document.body.classList.add('print-ready');

        html2canvas(invoice).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(filename);

            document.body.classList.remove('print-ready');
            
            inputs.forEach(input => {
                input.style.display = '';
            });
            spans.forEach(span => span.remove());

            Swal.fire({
                title: 'Success!',
                text: 'Invoice successfully generated!',
                icon: 'success'
            });
        });
    }

    generatePdfBtn.addEventListener('click', generatePDF);

    const invoiceNumberPrefix = document.getElementById('invoice-number-prefix');
    const invoiceNumberSuffixInput = document.getElementById('invoice-number-suffix');
    const invoiceDateInput = document.getElementById('invoice-date');
    const contactPersonInput = document.getElementById('contact-person');
    const invoiceNoteInput = document.getElementById('invoice-note');

    const displayInvoiceNumber = document.getElementById('display-invoice-number');
    const displayInvoiceDate = document.getElementById('display-invoice-date');
    const displayContactPerson = document.getElementById('display-contact-person');
    const displayInvoiceNote = document.getElementById('display-invoice-note');

    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }

    // Set default invoice date to today
    invoiceDateInput.valueAsDate = new Date();
    displayInvoiceDate.textContent = formatDate(invoiceDateInput.value);

    function updateInvoiceNumber() {
        const prefix = invoiceNumberPrefix.textContent;
        const suffix = invoiceNumberSuffixInput.value;
        displayInvoiceNumber.textContent = `${prefix}${suffix}`;
    }

    invoiceNumberSuffixInput.addEventListener('input', updateInvoiceNumber);


    invoiceDateInput.addEventListener('input', () => {
        displayInvoiceDate.textContent = formatDate(invoiceDateInput.value);
    });

    contactPersonInput.addEventListener('input', () => {
        displayContactPerson.textContent = contactPersonInput.value;
    });

    invoiceNoteInput.addEventListener('input', () => {
        displayInvoiceNote.textContent = invoiceNoteInput.value;
    });

    // Customer details
    const customerNameInput = document.getElementById('customer-name');
    const customerAddress1Input = document.getElementById('customer-address1');
    const customerAddress2Input = document.getElementById('customer-address2');
    const customerPhoneInput = document.getElementById('customer-phone');
    const customerEmailInput = document.getElementById('customer-email');

    const displayCustomerName = document.getElementById('display-customer-name');
    const displayCustomerAddress1 = document.getElementById('display-customer-address1');
    const displayCustomerAddress2 = document.getElementById('display-customer-address2');
    const displayCustomerPhone = document.getElementById('display-customer-phone');
    const displayCustomerEmail = document.getElementById('display-customer-email');

    const preparedByName = document.getElementById('prepared-by-name');

    customerNameInput.addEventListener('input', () => {
        displayCustomerName.textContent = customerNameInput.value;
    });
    customerAddress1Input.addEventListener('input', () => {
        displayCustomerAddress1.textContent = customerAddress1Input.value;
    });
    customerAddress2Input.addEventListener('input', () => {
        displayCustomerAddress2.textContent = customerAddress2Input.value;
    });
    customerPhoneInput.addEventListener('input', () => {
        displayCustomerPhone.textContent = customerPhoneInput.value;
    });
    customerEmailInput.addEventListener('input', () => {
        displayCustomerEmail.textContent = customerEmailInput.value;
    });
    
    populateVendors();
    if(vendors.length > 0) {
        updateVendorDetails(vendors[0]);
    }
    updateGrandTotals();
});