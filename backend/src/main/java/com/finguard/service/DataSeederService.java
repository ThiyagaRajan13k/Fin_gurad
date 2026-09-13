package com.finguard.service;

import com.finguard.entity.*;
import com.finguard.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DataSeederService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeederService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private SalesOrderRepository salesOrderRepository;
    @Autowired private ShipmentRepository shipmentRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private FinancingRequestRepository financingRequestRepository;
    @Autowired
    private FraudReportRepository fraudReportRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;
    @Autowired private FraudDetectionService fraudDetectionService;

    @Override
    public void run(String... args) throws Exception {
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin != null) {
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("analyst").isEmpty()) {
            User analyst = new User();
            analyst.setUsername("analyst");
            analyst.setPassword(passwordEncoder.encode("analyst123"));
            analyst.setFullName("Fraud Analyst 1");
            analyst.setRole(Role.ROLE_FRAUD_ANALYST);
            userRepository.save(analyst);
        }

        if (userRepository.findByUsername("bank").isEmpty()) {
            User bank = new User();
            bank.setUsername("bank");
            bank.setPassword(passwordEncoder.encode("bank123"));
            bank.setFullName("Officer BankCorp");
            bank.setRole(Role.ROLE_BANK_OFFICER);
            userRepository.save(bank);
        }

        seedMasterData();
        seedFraudReports();
        seedSystemSettings();
    }

    @Transactional
    public void seedSystemSettings() {
        if (systemSettingRepository.count() == 0) {
            systemSettingRepository.save(new SystemSetting("COMPANY_NAME", "FinGuard ERP Solutions", "Company Name", "General"));
            systemSettingRepository.save(new SystemSetting("COMPANY_EMAIL", "admin@finguard.com", "Company Email", "General"));
            systemSettingRepository.save(new SystemSetting("COMPANY_PHONE", "+1 234 567 8900", "Company Phone", "General"));
            systemSettingRepository.save(new SystemSetting("COMPANY_ADDRESS", "123 Business Avenue, Tech Park", "Company Address", "General"));
            systemSettingRepository.save(new SystemSetting("GST_PERCENTAGE", "18.0", "GST Percentage", "Financial"));
            systemSettingRepository.save(new SystemSetting("DEFAULT_CURRENCY", "USD", "Default Currency", "Financial"));
            systemSettingRepository.save(new SystemSetting("DEFAULT_INTEREST_RATE", "5.5", "Default Interest Rate", "Financial"));
            systemSettingRepository.save(new SystemSetting("MAX_FINANCING_AMOUNT", "1000000", "Maximum Financing Amount", "Financial"));
            systemSettingRepository.save(new SystemSetting("AUTO_APPROVAL_THRESHOLD", "50000", "Auto Approval Threshold", "Financial"));
            systemSettingRepository.save(new SystemSetting("INVOICE_PREFIX", "INV-", "Invoice Prefix", "Preferences"));
            systemSettingRepository.save(new SystemSetting("SALES_ORDER_PREFIX", "SO-", "Sales Order Prefix", "Preferences"));
            systemSettingRepository.save(new SystemSetting("SHIPMENT_PREFIX", "SHP-", "Shipment Prefix", "Preferences"));
            systemSettingRepository.save(new SystemSetting("FINANCING_PREFIX", "FIN-", "Financing Request Prefix", "Preferences"));
            systemSettingRepository.save(new SystemSetting("THEME", "Light", "Theme Settings", "Preferences"));
            systemSettingRepository.save(new SystemSetting("NOTIFICATIONS_ENABLED", "true", "Notification Settings", "Preferences"));
        }
    }

    @Transactional
    public void seedFraudReports() {
        financingRequestRepository.findAll().forEach(req -> {
            try {
                fraudDetectionService.generateReport(req);
            } catch (Exception e) {
                logger.warn("Could not generate fraud report for " + req.getRequestNumber() + ": " + e.getMessage(), e);
            }
        });
    }

    @Transactional
    public void seedMasterData() {
        seedUsers();
        List<Customer> customers = seedCustomers();
        List<Category> categories = seedCategories();
        List<Product> products = seedProducts(categories);
        seedInventory(products);
        List<SalesOrder> orders = seedSalesOrders(customers, products);
        seedShipments(orders);
        List<Invoice> invoices = seedInvoices(orders);
        seedFinancingRequests(invoices, customers.get(0));
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@finguard.com");
            admin.setFullName("System Administrator");
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);

            User supplier = new User();
            supplier.setUsername("supplier");
            supplier.setPassword(passwordEncoder.encode("supplier123"));
            supplier.setEmail("supplier@example.com");
            supplier.setFullName("Global Supplies Inc.");
            supplier.setRole(Role.ROLE_SUPPLIER);
            userRepository.save(supplier);

            logger.info("Users seeded");
        }
    }

    private List<Customer> seedCustomers() {
        if (customerRepository.count() == 0) {
            Customer c1 = new Customer();
            c1.setCustomerCode("CUST001");
            c1.setName("Acme Corporation");
            c1.setContactNumber("+1-555-0192");
            c1.setGstNumber("GST123456789");
            c1.setAddress("123 Business Rd, Metropolis");
            c1.setCreditLimit(new BigDecimal("500000"));
            customerRepository.save(c1);

            Customer c2 = new Customer();
            c2.setCustomerCode("CUST002");
            c2.setName("Globex Inc");
            c2.setContactNumber("+1-555-0987");
            c2.setGstNumber("GST987654321");
            c2.setAddress("456 Industrial Pkwy, Springfield");
            c2.setCreditLimit(new BigDecimal("250000"));
            customerRepository.save(c2);

            logger.info("Customers seeded");
            return List.of(c1, c2);
        }
        return customerRepository.findAll();
    }

    private List<Category> seedCategories() {
        if (categoryRepository.count() == 0) {
            Category cat1 = new Category();
            cat1.setName("Electronics");
            cat1.setDescription("Electronic devices and components");
            categoryRepository.save(cat1);

            Category cat2 = new Category();
            cat2.setName("Office Supplies");
            cat2.setDescription("General office supplies and stationery");
            categoryRepository.save(cat2);

            logger.info("Categories seeded");
            return List.of(cat1, cat2);
        }
        return categoryRepository.findAll();
    }

    private List<Product> seedProducts(List<Category> categories) {
        if (productRepository.count() == 0 && !categories.isEmpty()) {
            Category electronics = categories.get(0);
            Category office = categories.get(1);

            Product p1 = new Product();
            p1.setProductCode("PROD-E01");
            p1.setName("Dell XPS 15 Laptop");
            p1.setCategory(electronics);
            p1.setPrice(new BigDecimal("1500.00"));
            p1.setGstPercentage(new BigDecimal("18.0"));
            p1.setUnit("PCS");
            p1.setStatus("ACTIVE");
            productRepository.save(p1);

            Product p2 = new Product();
            p2.setProductCode("PROD-O01");
            p2.setName("Ergonomic Office Chair");
            p2.setCategory(office);
            p2.setPrice(new BigDecimal("250.00"));
            p2.setGstPercentage(new BigDecimal("12.0"));
            p2.setUnit("PCS");
            p2.setStatus("ACTIVE");
            productRepository.save(p2);

            logger.info("Products seeded");
            return List.of(p1, p2);
        }
        return productRepository.findAll();
    }

    private void seedInventory(List<Product> products) {
        if (inventoryRepository.count() == 0 && !products.isEmpty()) {
            for (Product product : products) {
                Inventory inv = new Inventory();
                inv.setProduct(product);
                inv.setAvailableStock(100);
                inv.setLowStockAlertLevel(20);
                inventoryRepository.save(inv);
            }
            logger.info("Inventory seeded");
        }
    }

    private List<SalesOrder> seedSalesOrders(List<Customer> customers, List<Product> products) {
        if (salesOrderRepository.count() == 0 && !customers.isEmpty() && !products.isEmpty()) {
            SalesOrder order1 = new SalesOrder();
            order1.setOrderNumber("SO-1001");
            order1.setCustomer(customers.get(0));
            order1.setStatus(OrderStatus.CONFIRMED);
            order1.setOrderDate(java.time.LocalDate.now().minusDays(5));
            order1.setExpectedDeliveryDate(java.time.LocalDate.now().plusDays(2));
            order1.setDiscount(new BigDecimal("50.00"));
            order1.setRemarks("Urgent delivery");

            SalesOrderItem item1 = new SalesOrderItem();
            item1.setProduct(products.get(0));
            item1.setQuantity(5);
            item1.setUnitPrice(products.get(0).getPrice());
            item1.setSubTotal(new BigDecimal("7500.00"));
            item1.setTaxAmount(new BigDecimal("1350.00"));
            order1.addItem(item1);

            order1.setTotalAmount(new BigDecimal("8800.00")); // 7500 + 1350 - 50
            order1.setTotalTax(new BigDecimal("1350.00"));

            salesOrderRepository.save(order1);

            logger.info("Sales Orders seeded");
            return List.of(order1);
        }
        return salesOrderRepository.findAll();
    }

    private void seedShipments(List<SalesOrder> orders) {
        if (shipmentRepository.count() == 0 && !orders.isEmpty()) {
            SalesOrder order = orders.get(0);

            Shipment shipment = new Shipment();
            shipment.setShipmentNumber("SHP-2001");
            shipment.setSalesOrder(order);
            shipment.setStatus(ShipmentStatus.DISPATCHED);
            shipment.setCarrierName("FedEx");
            shipment.setTrackingNumber("FDX987654321");
            shipment.setVehicleNumber("TN-01-AB-1234");
            shipment.setDriverName("John Smith");
            shipment.setDriverPhone("555-0198");
            shipment.setDispatchDate(LocalDateTime.now().minusDays(1));
            shipment.setEstimatedDelivery(LocalDateTime.now().plusDays(2));
            shipment.setRemarks("Handle with care");
            
            shipmentRepository.save(shipment);
            logger.info("Shipments seeded");
        }
    }

    private List<Invoice> seedInvoices(List<SalesOrder> orders) {
        if (invoiceRepository.count() == 0 && !orders.isEmpty()) {
            SalesOrder order = orders.get(0);

            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber("INV-3001");
            invoice.setCustomer(order.getCustomer());
            invoice.setSalesOrder(order);
            invoice.setStatus(InvoiceStatus.ISSUED);
            invoice.setInvoiceDate(java.time.LocalDate.now().minusDays(1));
            invoice.setDueDate(java.time.LocalDate.now().plusDays(29));
            
            invoice.setSubTotal(order.getTotalAmount().subtract(order.getTotalTax()).add(order.getDiscount()));
            invoice.setTaxAmount(order.getTotalTax());
            invoice.setDiscount(order.getDiscount());
            invoice.setTotalAmount(order.getTotalAmount());
            invoice.setAmountPaid(BigDecimal.ZERO);
            invoice.setRemarks("Please pay within 30 days");

            for (SalesOrderItem orderItem : order.getItems()) {
                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setProduct(orderItem.getProduct());
                invoiceItem.setQuantity(orderItem.getQuantity());
                invoiceItem.setUnitPrice(orderItem.getUnitPrice());
                invoiceItem.setSubTotal(orderItem.getSubTotal());
                invoiceItem.setTaxAmount(orderItem.getTaxAmount());
                invoice.addItem(invoiceItem);
            }

            invoiceRepository.save(invoice);
            logger.info("Invoices seeded");
            return List.of(invoice);
        }
        return invoiceRepository.findAll();
    }

    private void seedFinancingRequests(List<Invoice> invoices, Customer customer) {
        if (financingRequestRepository.count() == 0 && !invoices.isEmpty()) {
            Invoice invoice = invoices.get(0);

            FinancingRequest request = new FinancingRequest();
            request.setRequestNumber("FIN-4001");
            request.setCustomer(customer);
            request.setStatus(FinancingStatus.UNDER_REVIEW);
            request.setTenureDays(30);
            request.setInterestRate(new BigDecimal("1.5"));
            request.setRemarks("Requesting factoring for Acme Corp");
            
            FinancingRequestItem item = new FinancingRequestItem();
            item.setInvoice(invoice);
            item.setAmountRequested(invoice.getTotalAmount());
            request.addItem(item);

            request.setTotalAmountRequested(invoice.getTotalAmount());
            request.setTotalAmountApproved(BigDecimal.ZERO);

        financingRequestRepository.save(request);
        logger.info("Financing Requests seeded");

        try {
            fraudDetectionService.generateReport(request);
            logger.info("Fraud Report generated for FIN-4001");
        } catch (Exception e) {
            logger.warn("Could not generate fraud report for FIN-4001: " + e.getMessage());
        }
        }
    }
}
