package com.virat.job.service;

import com.virat.job.domain.CompanyStatus;
import com.virat.job.domain.CompanyType;
import com.virat.job.domain.IndustryType;
import com.virat.job.dto.request.CompanyRequest;
import com.virat.job.dto.response.CompanyResponse;
import com.virat.job.modal.Company;

import java.util.List;

public interface CompanyService {
    CompanyResponse createCompany(Long ownerId, CompanyRequest req) throws Exception;


    CompanyResponse getCompanyById(Long id) throws Exception;

    CompanyResponse getCompanySummaryById(Long id) throws Exception;

    CompanyResponse getMyCompany(Long ownerId) throws Exception;

    List<CompanyResponse> getAllCompanies(
            CompanyType companyType,
            IndustryType industryType,
            CompanyStatus status);

    CompanyResponse updateCompany(Long companyId, Long ownerId, CompanyRequest req)
            throws Exception;

    CompanyResponse verifyCompany(Long companyId) throws Exception;

    CompanyResponse deactivateCompany(Long companyId) throws Exception;

    void deleteCompany(Long companyId, Long ownerId) throws Exception;

    Company getCompanyEntityById(Long id) throws Exception;
}
