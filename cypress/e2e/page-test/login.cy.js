/// <reference types="cypress" />

describe("fomo-app-core", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("can view login panel", () => {
    cy.get("#signIn-panel").should("be.visible");
  });

  it("can login and logout", () => {
    const username = "fox1tech@gmail.com";
    const password = "Welcome@123";
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.contains("span", "Onboarding Checklist").should("be.visible");
    cy.get('button[aria-haspopup="menu"]').click();
    cy.get('div[role="menuitem"]').contains("Logout").click();
    cy.contains("p", "Sign in to access all the features of Fomo.").should(
      "be.visible"
    );
  });
});
