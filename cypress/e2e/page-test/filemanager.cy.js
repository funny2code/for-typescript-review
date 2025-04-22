/// <reference types="cypress" />

describe("fomo-app-core - FileManager", () => {
    beforeEach(() => {
      cy.visit("/");
    });
  
    it("can create/delete/move/copy/duplicate/upload/download a file/folder", () => {
        // test for login
        const username = "dejanbuk.dev@hotmail.com";
        const password = "Welcome!!24";
        cy.get('input[name="username"]').type(username);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();
        cy.wait(5000);
        cy.contains("span", "Onboarding Checklist", { timeout: 10000 }).should("be.visible");
                
        // test for Creating new company
        const companyName = "Test Company";
        const companyDescription = "Test Company Description";
        const companyWebsite = "https://www.fomo.ai.com";
        
        cy.visit("/companies/new");
        cy.wait(5000);

        cy.get('input[placeholder="Enter Company Name"]', {timeout: 2000}).as("newCompanyName");
        cy.get("@newCompanyName").click();
        cy.get("@newCompanyName").type(companyName);
        cy.get('textarea[placeholder="Enter Company Description"]').type(companyDescription);
        cy.get('input[placeholder="Enter Company Website"]').type(companyWebsite);
        cy.contains("button", "Create Company", { timeout: 10000 }).as("buttonNewCompany");
        cy.get("@buttonNewCompany").click();
        cy.contains("button", "Continue").click();

        // select the create company
        cy.get('button[id="company-select"]').click();
        cy.get('div[data-value="test company"]', {timeout: 2000}).click();
        cy.wait(5000);

        // select file manager nav link
        cy.get('a[id="sidenav_file_manager"]').as('fileManager')
        cy.get('@fileManager').click();
        cy.wait(5000);

        // file actions
        // create a new file in file manager
        cy.get('div[class="main-context-menu"]').rightclick(); cy.wait(2000);
        cy.contains('p', 'New File').as("newFileCreate");
        cy.get("@newFileCreate").click();
        cy.wait(2000);

        // delete the create test company and logout
        cy.url()
          .then(url => url.split("/")[4])
          .then((companyId) => {
            cy.log("companyId", companyId);
            cy.visit(`/companies/${companyId}`);
            cy.get("button#delete-company-button", { timeout: 20000 }).click();
            cy.wait(3000);
    
            cy.url().should("include", "/companies");
    
            cy.get("button#user-menu-button").click();
            cy.wait(1000);
            cy.get("div#logout-btn").click();
          });

        /* cy.get("body").then($body => {
          // checking if it's availabe to create new company
          console.log("creating a new company", $body)
          if ($body.find("input[palceholder='Enter Company Name']").length > 0) {
            // creating new company
            cy.get('input[placeholder="Enter Company Name"]').type(companyName);
            cy.get('textarea[placeholder="Enter Company Description"]').type(companyDescription);
            cy.get('input[placeholder="Enter Company Website"]').type(companyWebsite);
            cy.contains("button", "Create Company", { timeout: 10000 }).click();
    
            cy.wait(2000);
          } else {
            // skipping new company
          }

          // select the create company
          cy.get('button[id="company-select"]').click();
          cy.get('div[data-value="test company"]').click();
          cy.wait(5000);
          // select file manager nav link
          // cy.get('a[href^="/companies/"][href$="/file-manager"]').click();
          cy.get('a[id="sidenav_file_manager"]').click();
          cy.wait(5000);
          // loaded file manager page

          // create a file in root
          cy.get('div[class="main-context-menu"]').rightclick(); cy.wait(2000);
          cy.get("#new_folder_item").click();
        });        */ 
    });
  });
  