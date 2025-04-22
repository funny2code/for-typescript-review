import { updateCompanyData, setCompaniesData, setCompanyIndex, setCompany, setCompanyId, updateCompanyStateOrigin, setTool, setThread, setEditToolByAdmin, deleteCompany, unsetCompany, setNewCompany, setCompanyById, setProduct, deleteProduct } from "@redux/reducers/companyReducer";
import { Dispatch } from "redux";

export const updateCompanyAction = (companyFieldData: any) => (dispatch: Dispatch) => {
    dispatch(updateCompanyData(companyFieldData));
};

export const setCompaniesAction = (companyData: any) => (dispatch: Dispatch) => {
    dispatch(setCompaniesData(companyData));
};

export const setCompanyAction = (company: any) => (dispatch: Dispatch) => {
    dispatch(setCompany(company));
}
export const setCompanyByIdAction = (companyId: any) => (dispatch: Dispatch) => {
    dispatch(setCompanyById(companyId));
}

export const setCompanyIndexAction = (index: any) => (dispatch: Dispatch) => {
    dispatch(setCompanyIndex(index));
}

export const setCompanyIdAction = (id: any) => (dispatch: Dispatch) => {
    dispatch(setCompanyId(id));
}

export const updateCompanyStateOriginAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(updateCompanyStateOrigin(value));
}

export const setToolAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(setTool(value));
}

export const setThreadAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(setThread(value));
}

export const setEditToolByAdminAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(setEditToolByAdmin(value));
}

export const deleteCompanyAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(deleteCompany(value));
}

export const unsetCompanyAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(unsetCompany(value));
}

export const setNewCompanyAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(setNewCompany(value));
}

export const setProductAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(setProduct(value));
}

export const deleteProductAction = (value: any) => (dispatch: Dispatch) => {
    dispatch(deleteProduct(value));
}