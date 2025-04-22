import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ICompany, ICompanyState, IProduct, IThread, ITool } from "interfaces";

const initialState: ICompanyState = {
  companies: [],
  selectedIndex: null,
  selectedCompany: null,
  selectedCompanyId: null,
  isUpdatedFromServer: false,
  tools: [],
  selectedTool: null,
  selectedThread: null,
  editToolByAdmin: null
};

type CompanyPayload<K extends keyof ICompany> = {
  key: K;
  value: ICompany[K];
};

type ProductPayload<K extends keyof IProduct> = {
  key: K;
  value: IProduct[K];
};

export const companyReducer = createSlice({
  name: "company",
  initialState,
  reducers: {
    updateCompanyData: <K extends keyof ICompany>(
      state: ICompanyState,
      action: PayloadAction<CompanyPayload<K>>
    ) => {
      const { key, value } = action.payload;
      if (state.selectedCompany) {
        state.selectedCompany[key] = value;
      }
    },

    setCompaniesData: (state: ICompanyState, action: PayloadAction<ICompany[]>) => {
        const companyData = action.payload;
        state.companies = companyData;
        if (state.selectedCompany) {
          for (let i = 0; i < companyData.length; ++ i) {
            if (companyData[i].id == state.selectedCompany.id) {
              state.selectedCompany = companyData[i];
              break;
            }
          }
        }
    },

    setCompanyIndex: (state: ICompanyState, action: PayloadAction<number | null>) => {
      state.selectedIndex = action.payload;
    },

    setCompany: (state: ICompanyState, action: PayloadAction<ICompany | null>) => {
      state.selectedCompany = action.payload;
    },

    setCompanyById: (state: ICompanyState, action: PayloadAction<string>) => {
      const selectedCompanyID = action.payload;
      const selectedCompanies = state.companies.filter(company => company.id == selectedCompanyID);
      if (selectedCompanies.length > 0) state.selectedCompany = selectedCompanies[0];
    },

    setCompanyId: (state: ICompanyState, action: PayloadAction<string | null>) => {
      state.selectedCompanyId = action.payload;
    },

    updateCompanyStateOrigin: (state: ICompanyState, action: PayloadAction<boolean>) => {
      state.isUpdatedFromServer = action.payload;
    },

    setTool: (state: ICompanyState, action: PayloadAction<ITool>) => {
      state.selectedTool = action.payload;
    },

    setThread: (state: ICompanyState, action: PayloadAction<IThread>) => {
      state.selectedThread = action.payload;
    },

    setEditToolByAdmin: (state: ICompanyState, action: PayloadAction<ITool>) => {
      state.editToolByAdmin = action.payload;
    },

    deleteCompany: (state: ICompanyState, action: PayloadAction<ICompany>) => {
      const deletedCompany = action.payload;
      if (deletedCompany.id == state.selectedCompany?.id) {
        state.selectedCompany = null;
        state.selectedCompanyId = null;
      }
      const updatedCompanies = state.companies.filter(company => company.id != deletedCompany.id);
      state.companies = updatedCompanies;
    },

    unsetCompany: (state: ICompanyState, action) => {
      state.selectedCompany = null;
    },

    setNewCompany: (state: ICompanyState) => {
      state.selectedCompany = {
        id: "new-company",
        companyName: "",
        companyBackground: "",
        companyWebsite: "",
        socials: [],
        brandPromise: "",
        brandTone: "",
        brandToneSentiments: [],
        brandToneKeywords: { use: "", avoid: "" },
        brandValueProp: "",
        brandPersonas: [],
        brandContentPillars: [],
        status: "",
        companyTypes: "OTHER",
        members: [],
        products: [],
        iterations: [],
        threads: [],
        joinCodes: [],
        AIrequests: [],

        slider_1_c2p: 3,
        slider_2_t2t: 3,
        slider_3_i2p: 3,
        slider_4_p2r: 3,
        slider_5_u2c: 3,
      };
    },

    setProduct: (state: ICompanyState, action: PayloadAction<string>) => {
      const productId = action.payload;
      // console.log("product id: ", productId);
      if (state.selectedCompany) {
        const products = state.selectedCompany.products || [];
        // console.log("products: track in redux: ", products);
        if (products.length > 0) {
          state.selectedProduct = products.filter(product => product.id == productId)[0];
          // console.log("selected product in redux: ", state.selectedProduct);
        }
      }
    },

    deleteProduct: (state: ICompanyState, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.selectedCompany && state.selectedCompany.products) {
        if (state.selectedProduct && state.selectedProduct.id == productId) state.selectedProduct = null;
        const updatedProducts = state.selectedCompany.products.filter(product => product.id != productId);
        state.selectedCompany.products = updatedProducts;
      }
    },
    /* 
    updateCompanyData: <K extends keyof ICompany>(
      state: ICompanyState,
      action: PayloadAction<CompanyPayload<K>>
    ) => {
      const { key, value } = action.payload;
      if (state.selectedCompany) {
        state.selectedCompany[key] = value;
      }
    },
     */
    updateProduct: <K extends keyof IProduct> (
      state: ICompanyState,
      action: PayloadAction<ProductPayload<K>>
    ) => {
      const { key, value } = action.payload;
      if (state.selectedCompany && state.selectedProduct) {
        state.selectedProduct[key] = value;
      }
    }

  },
});

export const {
  updateCompanyData,
  setCompaniesData,
  setCompanyIndex,
  setCompany,
  setCompanyById,
  setNewCompany,
  unsetCompany,
  setCompanyId,
  updateCompanyStateOrigin,
  setTool,
  setThread,
  setEditToolByAdmin,
  deleteCompany,
  setProduct,
  deleteProduct,

} = companyReducer.actions;

export const selectCompanyState = (state: any) => state.company;

export default companyReducer.reducer;
