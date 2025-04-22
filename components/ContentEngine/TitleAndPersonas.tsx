"use client";

import { Accordion } from "@aws-amplify/ui-react";
import { Schema } from "amplify/data/resource";
import React from "react";

type Keyword = Schema["Keyword"]["type"];
interface TitleAndPersonasComponentProps {
  keyword: Keyword;
}

const TitleAndPersonasComponent: React.FC<TitleAndPersonasComponentProps> = ({
  keyword,
}) => {
  return (
    <div>
      <p>Title: {keyword?.keyword}</p>
      <h1>Current Status : {keyword.status}</h1>
      <p>Phase: {keyword.phase}</p>
      <p>Description: {keyword.description}</p>
      <p>Keyword: {keyword.keyword}</p>
      <p>ProductId: {keyword.productId}</p>
      <p>Template Type: {keyword.templateType}</p>
      <div>
        <Accordion.Container>
          <Accordion.Item value="sme-creation">
            <Accordion.Trigger>
              SME Creation - Pending
              <Accordion.Icon />
            </Accordion.Trigger>
            <Accordion.Content>{keyword.sme}</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="scrape-related-content">
            <Accordion.Trigger>
              Scrape Related Content - Pending
              <Accordion.Icon />
            </Accordion.Trigger>
            <Accordion.Content>Scrapeing in progress</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="title-and-personas">
            <Accordion.Trigger>
              Title and Personas Generation - Pending
              <Accordion.Icon />
            </Accordion.Trigger>
            <Accordion.Content>
              title and Persona Generation in progress
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="related-keyword-analysis">
            <Accordion.Trigger>
              Related Keyword Analysis - Pending
              <Accordion.Icon />
            </Accordion.Trigger>
            <Accordion.Content>
              Related Keyword Analysis in progress
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Container>
      </div>
    </div>
  );
};

export default TitleAndPersonasComponent;
