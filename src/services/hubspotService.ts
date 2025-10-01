// HubSpot API Integration Service
export interface HubSpotContact {
  email: string;
  firstname: string;
  lastname: string;
  jobtitle?: string;
  company?: string;
  phone?: string;
  website?: string;
}

export interface HubSpotDeal {
  dealname: string;
  dealstage: string;
  amount?: string;
  closedate?: string;
  pipeline?: string;
  hubspot_owner_id?: string;
}

export interface HubSpotCompany {
  name: string;
  domain?: string;
  industry?: string;
  description?: string;
}

class HubSpotService {
  private baseUrl = 'https://api.hubapi.com';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PATCH' = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HubSpot API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('HubSpot API Request Failed:', error);
      throw error;
    }
  }

  // Search for existing contact by email
  async searchContactByEmail(email: string) {
    try {
      const response = await this.makeRequest(
        `/crm/v3/objects/contacts/search`,
        'POST',
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email
                }
              ]
            }
          ]
        }
      );
      
      return response.results && response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
      console.error('Error searching contact:', error);
      return null;
    }
  }

  // Search for existing company by domain
  async searchCompanyByDomain(domain: string) {
    try {
      const response = await this.makeRequest(
        `/crm/v3/objects/companies/search`,
        'POST',
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'domain',
                  operator: 'EQ',
                  value: domain
                }
              ]
            }
          ]
        }
      );
      
      return response.results && response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
      console.error('Error searching company:', error);
      return null;
    }
  }

  // Create or update contact
  async createOrUpdateContact(contactData: HubSpotContact) {
    try {
      // First, search for existing contact
      const existingContact = await this.searchContactByEmail(contactData.email);
      
      const properties = {
        email: contactData.email,
        firstname: contactData.firstname,
        lastname: contactData.lastname,
        jobtitle: contactData.jobtitle || '',
        company: contactData.company || '',
        phone: contactData.phone || '',
        website: contactData.website || '',
      };

      if (existingContact) {
        // Update existing contact
        const response = await this.makeRequest(
          `/crm/v3/objects/contacts/${existingContact.id}`,
          'PATCH',
          { properties }
        );
        return { ...response, isNew: false };
      } else {
        // Create new contact
        const response = await this.makeRequest(
          `/crm/v3/objects/contacts`,
          'POST',
          { properties }
        );
        return { ...response, isNew: true };
      }
    } catch (error) {
      console.error('Error creating/updating contact:', error);
      throw error;
    }
  }

  // Create or update company
  async createOrUpdateCompany(companyData: HubSpotCompany) {
    try {
      let existingCompany = null;
      
      // Search by domain if provided
      if (companyData.domain) {
        existingCompany = await this.searchCompanyByDomain(companyData.domain);
      }

      const properties = {
        name: companyData.name,
        domain: companyData.domain || '',
        industry: companyData.industry || 'INFORMATION_TECHNOLOGY_AND_SERVICES',
        description: companyData.description || 'Digital Readiness Assessment Client',
      };

      if (existingCompany) {
        // Update existing company
        const response = await this.makeRequest(
          `/crm/v3/objects/companies/${existingCompany.id}`,
          'PATCH',
          { properties }
        );
        return { ...response, isNew: false };
      } else {
        // Create new company
        const response = await this.makeRequest(
          `/crm/v3/objects/companies`,
          'POST',
          { properties }
        );
        return { ...response, isNew: true };
      }
    } catch (error) {
      console.error('Error creating/updating company:', error);
      throw error;
    }
  }

  // Search for existing deal by name and company
  async searchDealByNameAndCompany(dealName: string, companyId?: string) {
    try {
      const filterGroups: any[] = [
        {
          filters: [
            {
              propertyName: 'dealname',
              operator: 'EQ',
              value: dealName
            }
          ]
        }
      ];

      // If we have a company ID, add it as an additional filter
      if (companyId) {
        filterGroups.push({
          filters: [
            {
              propertyName: 'associations.company',
              operator: 'EQ',
              value: companyId
            }
          ]
        });
      }

      const response = await this.makeRequest(
        `/crm/v3/objects/deals/search`,
        'POST',
        {
          filterGroups,
          properties: ['dealname', 'dealstage', 'amount', 'createdate']
        }
      );
      
      return response.results && response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
      console.error('Error searching deal:', error);
      return null;
    }
  }

  // Alternative: Search deals by company association (more reliable)
  async searchDealsByCompany(companyId: string, dealType: string) {
    try {
      // Get all deals associated with the company
      const response = await this.makeRequest(
        `/crm/v3/objects/companies/${companyId}/associations/deals`
      );

      if (response.results && response.results.length > 0) {
        // Get deal details for each associated deal
        const dealIds = response.results.map((deal: any) => deal.id);
        const dealDetails = await Promise.all(
          dealIds.map(async (dealId: string) => {
            try {
              return await this.makeRequest(`/crm/v3/objects/deals/${dealId}`);
            } catch (error) {
              return null;
            }
          })
        );

        // Filter for deals that match our criteria
        const matchingDeals = dealDetails.filter(deal => 
          deal && 
          deal.properties.dealname && 
          deal.properties.dealname.includes(dealType === 'TIER1_FOLLOWUP' ? 'Tier 1 Follow-up' : 'Tier 2 Assessment')
        );

        return matchingDeals.length > 0 ? matchingDeals[0] : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error searching deals by company:', error);
      return null;
    }
  }

  // Create deal
  async createOrUpdateDeal(dealData: HubSpotDeal, contactId?: string, companyId?: string, callType?: string) {
    try {
      // Check for existing deal first
      let existingDeal = null;
      
      if (companyId && callType) {
        existingDeal = await this.searchDealsByCompany(companyId, callType);
      }
      
      if (!existingDeal) {
        // Also try searching by deal name
        existingDeal = await this.searchDealByNameAndCompany(dealData.dealname, companyId);
      }

      const properties = {
        dealname: dealData.dealname,
        dealstage: dealData.dealstage,
        amount: dealData.amount || '0',
        closedate: dealData.closedate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        pipeline: dealData.pipeline || 'default',
        hubspot_owner_id: dealData.hubspot_owner_id || '',
      };

      if (existingDeal) {
        // Update existing deal
        console.log(`Updating existing deal: ${existingDeal.id}`);
        const response = await this.makeRequest(
          `/crm/v3/objects/deals/${existingDeal.id}`,
          'PATCH',
          { properties }
        );
        return { ...response, isNew: false, updated: true };
      }

      // Create new deal
      console.log('Creating new deal');
      const dealPayload: any = { properties };

      // Associate with contact and company if provided
      if (contactId || companyId) {
        dealPayload.associations = [];
        
        if (contactId) {
          dealPayload.associations.push({
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Deal to Contact
          });
        }
        
        if (companyId) {
          dealPayload.associations.push({
            to: { id: companyId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }] // Deal to Company
          });
        }
      }

      const response = await this.makeRequest(
        `/crm/v3/objects/deals`,
        'POST',
        dealPayload
      );
      
      return { ...response, isNew: true };
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  // Complete workflow: Create contact, company, and deal
  async createCallRequestWorkflow(data: {
    userEmail: string;
    userName: string;
    userJobTitle?: string;
    companyName: string;
    companyDomain: string;
    callType: 'TIER1_FOLLOWUP' | 'TIER2_REQUEST';
    assessmentScore?: number;
    preferredDate: string;
    preferredTimes: string[];
    remarks?: string;
  }) {
    try {
      const nameParts = data.userName.split(' ');
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';

      // 1. Create/Update Company
      const company = await this.createOrUpdateCompany({
        name: data.companyName,
        domain: data.companyDomain,
        industry: 'INFORMATION_TECHNOLOGY_AND_SERVICES',
        description: 'Digital Readiness Assessment Client'
      });

      // 2. Create/Update Contact
      const contact = await this.createOrUpdateContact({
        email: data.userEmail,
        firstname,
        lastname,
        jobtitle: data.userJobTitle,
        company: data.companyName,
        website: `https://${data.companyDomain}`
      });

      // 3. Create Deal
      const dealName = `${data.callType === 'TIER1_FOLLOWUP' ? 'Tier 1 Follow-up' : 'Tier 2 Assessment'} - ${data.companyName}`;
      const dealStage = 'appointmentscheduled'; // Adjust based on your HubSpot pipeline
      
      const deal = await this.createOrUpdateDeal({
        dealname: dealName,
        dealstage: dealStage,
        amount: data.callType === 'TIER1_FOLLOWUP' ? '5000' : '15000', // Estimated values
        pipeline: 'default'
      }, contact.id, company.id, data.callType);

      // 4. Add notes to the deal
      if (data.remarks || data.assessmentScore) {
        const notes = [];
        if (data.assessmentScore) {
          notes.push(`Assessment Score: ${data.assessmentScore}/100`);
        }
        if (data.remarks) {
          notes.push(`Remarks: ${data.remarks}`);
        }
        notes.push(`Preferred Date: ${data.preferredDate}`);
        notes.push(`Preferred Times: ${data.preferredTimes.join(', ')}`);
        
        // Note: Adding notes requires additional API call to engagements
        // This is a simplified version - you might want to add this as a custom property
      }

      return {
        success: true,
        contact: { id: contact.id, isNew: contact.isNew },
        company: { id: company.id, isNew: company.isNew },
        deal: { id: deal.id, isNew: deal.isNew, updated: deal.updated },
        message: `Successfully ${contact.isNew ? 'created' : 'updated'} contact, ${company.isNew ? 'created' : 'updated'} company, and ${deal.isNew ? 'created new' : 'updated existing'} deal`
      };

    } catch (error) {
      console.error('HubSpot workflow failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export singleton instance
let hubspotService: HubSpotService | null = null;

export const getHubSpotService = (accessToken?: string): HubSpotService => {
  if (!hubspotService && accessToken) {
    hubspotService = new HubSpotService(accessToken);
  }
  
  if (!hubspotService) {
    throw new Error('HubSpot service not initialized. Please provide access token.');
  }
  
  return hubspotService;
};

export default HubSpotService;