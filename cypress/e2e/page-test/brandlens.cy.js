/// <reference types="cypress" />

describe("fomo-app-core - BrandLens", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("can create a company and generate brandlens", () => {
    const username = "fox1tech@gmail.com";
    const password = "Welcome@123";
    const companyName = "Test Company";
    const companyDescription = "Test Company Description";
    const companyWebsite = "https://www.google.com";
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    cy.contains("span", "Onboarding Checklist", { timeout: 10000 }).should(
      "be.visible"
    );

    // login complete

    //  Create a new company
    cy.visit("/companies/new");

    cy.get('input[placeholder="Enter Company Name"]').type(companyName);
    cy.get('textarea[placeholder="Enter Company Description"]').type(
      companyDescription
    );
    cy.get('input[placeholder="Enter Company Website"]').type(companyWebsite);
    cy.contains("button", "Create Company", { timeout: 10000 }).click();
    cy.contains("button", "Continue").click();
    // company created

    //  Create a new brand lens
    cy.url().should("include", "/brand-lens/setupV2");

    cy.contains("h3", "Brand Details");
    cy.contains("button", "Save and Continue").eq(0).click();
    cy.contains("button", "Confirm", { timeout: 10000 }).click();
    cy.get('li[data-front="true"]', { timeout: 20000 }).should(
      "have.text",
      "Brand Promise generation Completed"
    );
    cy.get('div[id="brand-promise"] h3').should("have.text", "Brand Promise");
    cy.wait(3000);
    cy.get('button[id="generate-brand-tone"]').click();
    cy.wait(2000);
    cy.get("input#positive-keyword-input").type("Friendly");
    cy.wait(1000);
    cy.get("button#add-positive-word").click();
    cy.wait(2000);
    cy.get("input#negative-keyword-input").type("Folksy");
    cy.wait(1000);
    cy.get("button#add-negative-word").click();
    cy.wait(2000);
    cy.get("input#positive-keyword-input").type("Playful");
    cy.wait(1000);
    cy.get("button#add-positive-word").click();
    cy.wait(2000);
    cy.get("input#negative-keyword-input").type("Boring");
    cy.wait(1000);
    cy.get("button#add-negative-word").click();
    // cy.wait(2000);
    // cy.get("input#positive-keyword-input").type("Bold");
    // cy.wait(1000);
    // cy.get("button#add-positive-word").click();
    // cy.wait(2000);
    // cy.get("input#negative-keyword-input").type("Sloppy");
    // cy.wait(1000);
    // cy.get("button#add-negative-word").click();
    // cy.wait(2000);
    // cy.get("input#positive-keyword-input").type("Calm");
    // cy.wait(1000);
    // cy.get("button#add-positive-word").click();
    // cy.wait(2000);
    // cy.get("input#negative-keyword-input").type("Childish");
    // cy.wait(1000);
    // cy.get("button#add-negative-word").click();
    cy.wait(2000);
    cy.get('button[id="save-generate-tone"]').click();
    cy.wait(2000);

    cy.get('li[data-front="true"]', { timeout: 20000 }).should(
      "have.text",
      "Brand Tone of Voice generation Completed"
    );

    cy.get("button#generate-brand-value").click();
    cy.wait(2000);
    cy.contains("button", "Confirm", { timeout: 10000 }).click();

    cy.get('li[data-front="true"]', { timeout: 20000 }).should(
      "have.text",
      "Brand Value Proposition generation Completed"
    );
    cy.get('div[id="brand-value-prop"] h3', { timeout: 20000 }).should(
      "have.text",
      "Brand Value Proposition"
    );
    cy.wait(2000);
    cy.get("button#generate-brand-personas").click();
    cy.contains("button", "Confirm").click();

    cy.get('li[data-front="true"]', { timeout: 20000 }).should(
      "have.text",
      "Brand Personas generation Completed"
    );

    cy.get('div[id="brand-persona"] h3').should("have.text", "Brand Personas");

    cy.get("button#generate-brand-pillars").click();
    cy.contains("button", "Confirm").click();

    cy.get('li[data-front="true"]', { timeout: 20000 }).should(
      "have.text",
      "Content Pillars generation Completed"
    );

    cy.wait(2000);

    cy.get("button#view-tools").click();
    cy.wait(2000);

    let companyId;
    cy.url()
      .then((url) => {
        cy.log(url.split("/")[4]);
        companyId = url.split("/")[4];
      })
      .then(() => {
        cy.log("companyId", companyId);
        cy.visit(`/companies/${companyId}`);
      });

    cy.get("button#delete-company-button", { timeout: 20000 }).click();
    cy.wait(3000);

    cy.url().should("include", "/companies");

    cy.get("button#user-menu-button").click();
    cy.wait(1000);
    cy.get("div#logout-btn").click();
  });
});
