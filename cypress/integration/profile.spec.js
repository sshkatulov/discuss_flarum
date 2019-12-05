'use strict';
/// <reference types="Cypress" />

import credentials from '../fixtures/credentials.json';
import stubbedResponse from '../fixtures/stubbedResponse.json';

context('Profile', () => {
  beforeEach(() => {
    cy.login(credentials.user, credentials.password);
  });

  it('Change user profile on front-end only', () => {
    const fakeBio = stubbedResponse.data.attributes.bio;

    cy.server();
    cy.route('/api/posts*').as('getDetails');
    cy.route('POST', '/api/users/*', stubbedResponse).as('fakePost');

    cy.visit(`/u/${credentials.user}`);

    cy.wait('@getDetails').then((response) => {
      response.response.body.included[0].attributes.bio = fakeBio;
      return response.response.body;
    }).as('fakeDetails');

    cy.get('.UserBio-content')
      .click();
    cy.get('.UserBio > .FormControl')
      .clear()
      .type(fakeBio)
      .type('{enter}');
    cy.wait('@fakePost')
      .then((request) => expect(request.requestBody.data.attributes.bio).to.eq(fakeBio));

    cy.visit('/');
    cy.route('GET', '/api/posts*', '@fakeDetails')
      .as('fakeGet');

    cy.visit(`/u/${credentials.user}`);

    cy.wait('@fakeGet');
    cy.get('.UserBio-content')
      .should('contain', fakeBio);
  });
});
