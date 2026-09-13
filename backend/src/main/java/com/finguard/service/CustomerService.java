package com.finguard.service;

import com.finguard.dto.CustomerDto;
import com.finguard.entity.Customer;
import com.finguard.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("Customer not found"));
        return convertToDto(customer);
    }

    public CustomerDto createCustomer(CustomerDto dto) {
        if (customerRepository.findByCustomerCode(dto.getCustomerCode()).isPresent()) {
            throw new RuntimeException("Customer code already exists");
        }
        Customer customer = new Customer();
        updateEntityFromDto(customer, dto);
        return convertToDto(customerRepository.save(customer));
    }

    public CustomerDto updateCustomer(Long id, CustomerDto dto) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("Customer not found"));
        updateEntityFromDto(customer, dto);
        return convertToDto(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    private CustomerDto convertToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setCustomerCode(customer.getCustomerCode());
        dto.setName(customer.getName());
        dto.setGstNumber(customer.getGstNumber());
        dto.setAddress(customer.getAddress());
        dto.setContactNumber(customer.getContactNumber());
        dto.setCreditLimit(customer.getCreditLimit());
        return dto;
    }

    private void updateEntityFromDto(Customer customer, CustomerDto dto) {
        customer.setCustomerCode(dto.getCustomerCode());
        customer.setName(dto.getName());
        customer.setGstNumber(dto.getGstNumber());
        customer.setAddress(dto.getAddress());
        customer.setContactNumber(dto.getContactNumber());
        customer.setCreditLimit(dto.getCreditLimit());
    }
}
