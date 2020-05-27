/*
 * Copyright (C) 2020 The ToastHub Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use-strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as defectActions from './defect-actions';
import fuLogger from '../../core/common/fu-logger';
import DefectView from '../../memberView/pm_defect/defect-view';
import DefectModifyView from '../../memberView/pm_defect/defect-modify-view';
import utils from '../../core/common/utils';
import moment from 'moment';


class PMDefectContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {pageName:"PM_DEFECT",isDeleteModalOpen: false, errors:null, warns:null, successes:null};
		this.onListLimitChange = this.onListLimitChange.bind(this);
		this.onSearchClick = this.onSearchClick.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this);
		this.onPaginationClick = this.onPaginationClick.bind(this);
		this.onOrderBy = this.onOrderBy.bind(this);
		this.openDeleteModal = this.openDeleteModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.onSave = this.onSave.bind(this);
		this.onModify = this.onModify.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onEditRoles = this.onEditRoles.bind(this);
		this.inputChange = this.inputChange.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.clearVerifyPassword = this.clearVerifyPassword.bind(this);
	}

	componentDidMount() {
		this.props.actions.init();
	}

	onListLimitChange(fieldName) {
		return (event) => {
			let value = 20;
			if (this.props.codeType === 'NATIVE') {
				value = event.nativeEvent.text;
			} else {
				value = event.target.value;
			}

			let listLimit = parseInt(value);
			this.props.actions.listLimit({state:this.props.pmdefect,listLimit});
		};
	}

	onPaginationClick(value) {
		return(event) => {
			fuLogger.log({level:'TRACE',loc:'DefectContainer::onPaginationClick',msg:"fieldName "+ value});
			let listStart = this.props.pmdefect.listStart;
			let segmentValue = 1;
			let oldValue = 1;
			if (this.state["PM_DEFECT_PAGINATION"] != null && this.state["PM_DEFECT_PAGINATION"] != ""){
				oldValue = this.state["PM_DEFECT_PAGINATION"];
			}
			if (value === "prev") {
				segmentValue = oldValue - 1;
			} else if (value === "next") {
				segmentValue = oldValue + 1;
			} else {
				segmentValue = value;
			}
			listStart = ((segmentValue - 1) * this.props.pmdefect.listLimit);
			this.setState({"PM_DEFECT_PAGINATION":segmentValue});
			
			this.props.actions.list({state:this.props.pmdefect,listStart});
		};
	}

	onSearchChange(fieldName) {
		return (event) => {
			if (event.type === 'keypress' && event.key === 'Enter') {
				this.searchClick(fieldName,event);
			} else {
				if (this.props.codeType === 'NATIVE') {
					this.setState({[fieldName]:event.nativeEvent.text});
				} else {
					this.setState({[fieldName]:event.target.value});
				}
			}
		};
	}

	onSearchClick(fieldName) {
		return (event) => {
			this.searchClick(fieldName,event);
		};
	}
	
	searchClick(fieldName,event) {
		let searchCriteria = [];
		if (fieldName === 'PM_DEFECT-SEARCHBY') {
			if (event != null) {
				for (let o = 0; o < event.length; o++) {
					let option = {};
					option.searchValue = this.state['PM_DEFECT-SEARCH'];
					option.searchColumn = event[o].value;
					searchCriteria.push(option);
				}
			}
		} else {
			for (let i = 0; i < this.props.pmdefect.searchCriteria.length; i++) {
				let option = {};
				option.searchValue = this.state['PM_DEFECT-SEARCH'];
				option.searchColumn = this.props.pmdefect.searchCriteria[i].searchColumn;
				searchCriteria.push(option);
			}
		}

		this.props.actions.search({state:this.props.pmdefect,searchCriteria});
	}

	onOrderBy(selectedOption) {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'DefectContainer::onOrderBy',msg:"id " + selectedOption});
			let orderCriteria = [];
			if (event != null) {
				for (let o = 0; o < event.length; o++) {
					let option = {};
					if (event[o].label.includes("ASC")) {
						option.orderColumn = event[o].value;
						option.orderDir = "ASC";
					} else if (event[o].label.includes("DESC")){
						option.orderColumn = event[o].value;
						option.orderDir = "DESC";
					} else {
						option.orderColumn = event[o].value;
					}
					orderCriteria.push(option);
				}
			} else {
				let option = {orderColumn:"PM_DEFECT_TABLE_NAME",orderDir:"ASC"};
				orderCriteria.push(option);
			}
			this.props.actions.orderBy({state:this.props.pmdefect,orderCriteria});
		};
	}
	
	onSave() {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'DefectContainer::onSave',msg:"test"});
			let errors = utils.validateFormFields(this.props.pmdefect.prefForms.PM_DEFECT_FORM,this.props.pmdefect.inputFields);
			
			if (errors.isValid){
				this.props.actions.saveItem({state:this.props.pmdefect});
			} else {
				this.setState({errors:errors.errorMap});
			}
		};
	}
	
	onModify(item) {
		return (event) => {
			let id = null;
			if (item != null && item.id != null) {
				id = item.id;
			}
			fuLogger.log({level:'TRACE',loc:'DefectContainer::onModify',msg:"test"+id});
			this.props.actions.modifyItem(id);
		};
	}
	
	onDelete(item) {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'DefectContainer::onDelete',msg:"test"});
			this.setState({isDeleteModalOpen:false});
			if (item != null && item.id != "") {
				this.props.actions.deleteItem({state:this.props.pmdefect,id:item.id});
			}
		};
	}
	
	openDeleteModal(item) {
		return (event) => {
		    this.setState({isDeleteModalOpen:true,selected:item});
		}
	}
	
	onEditRoles(item) {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'DefectContainer::onEditRoles',msg:"test"+item.id});
			this.props.history.push({pathname:'/admin-roles',state:{parent:item}});
		};
	}
	
	closeModal() {
		return (event) => {
			this.setState({isDeleteModalOpen:false,errors:null,warns:null});
		};
	}
	
	onCancel() {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'DefectContainer::onCancel',msg:"test"});
			this.props.actions.list({state:this.props.pmdefect});
		};
	}
	
	inputChange(fieldName,switchValue) {
		return (event) => {
			let value = "";
			if (switchValue === "DATE") {
				value = event.toISOString();
			} else {
				value = switchValue;
			}
			utils.inputChange(this.props,fieldName,value);
		};
	}
	
	onBlur(field) {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'DefectContainer::onBlur',msg:field.name});
			let fieldName = field.name;
			// get field and check what to do
			if (field.optionalParams != ""){
				let optionalParams = JSON.parse(field.optionalParams);
				if (optionalParams.onBlur != null) {
					if (optionalParams.onBlur.validation != null && optionalParams.onBlur.validation == "matchField") {
						if (field.validation != "") {
							let validation = JSON.parse(field.validation);
							if (validation[optionalParams.onBlur.validation] != null && validation[optionalParams.onBlur.validation].id != null){
								if (this.props.pmdefect.inputFields[validation[optionalParams.onBlur.validation].id] == this.props.pmdefect.inputFields[fieldName]) {
									if (validation[optionalParams.onBlur.validation].successMsg != null) {
										let successMap = this.state.successes;
										if (successMap == null){
											successMap = {};
										}
										successMap[fieldName] = validation[optionalParams.onBlur.validation].successMsg;
										this.setState({successes:successMap, errors:null});
									}
								} else {
									if (validation[optionalParams.onBlur.validation].failMsg != null) {
										let errorMap = this.state.errors;
										if (errorMap == null){
											errorMap = {};
										}
										errorMap[fieldName] = validation[optionalParams.onBlur.validation].failMsg;
										this.setState({errors:errorMap, successes:null});
									}
								}
							}
						}
					} else if (optionalParams.onBlur.func != null) {
						if (optionalParams.onBlur.func == "clearVerifyPassword"){
							this.clearVerifyPassword();
						}
					}
				}
			}
			
		};
	}
	
	clearVerifyPassword() {
	//	return (event) => {
			fuLogger.log({level:'TRACE',loc:'DefectContainer::clearVerifyPassword',msg:"Hi there"});
			this.setState({errors:null, successes:null});
			this.props.actions.clearField('PM_DEFECT_FORM_VERIFY_PASSWORD');
	//	}
	}

	render() {
		fuLogger.log({level:'TRACE',loc:'DefectContainer::render',msg:"Hi there"});
		if (this.props.pmdefect.isModifyOpen) {
			return (
				<DefectModifyView
				containerState={this.state}
				item={this.props.pmdefect.selected}
				inputFields={this.props.pmdefect.inputFields}
				appPrefs={this.props.appPrefs}
				itemPrefForms={this.props.pmdefect.prefForms}
				onSave={this.onSave}
				onCancel={this.onCancel}
				onReturn={this.onCancel}
				inputChange={this.inputChange}
				onBlur={this.onBlur}/>
			);
		} else if (this.props.pmdefect.items != null) {
			return (
				<DefectView
				containerState={this.state}
				itemState={this.props.pmdefect}
				appPrefs={this.props.appPrefs}
				onListLimitChange={this.onListLimitChange}
				onSearchChange={this.onSearchChange}
				onSearchClick={this.onSearchClick}
				onPaginationClick={this.onPaginationClick}
				onOrderBy={this.onOrderBy}
				openDeleteModal={this.openDeleteModal}
				closeModal={this.closeModal}
				onModify={this.onModify}
				onDelete={this.onDelete}
				onEditRoles={this.onEditRoles}
				inputChange={this.inputChange}
				session={this.props.session}
				/>
			);
		} else {
			return (<div> Loading... </div>);
		}
	}
}

PMDefectContainer.propTypes = {
	appPrefs: PropTypes.object,
	actions: PropTypes.object,
	pmdefect: PropTypes.object,
	session: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {appPrefs:state.appPrefs, pmdefect:state.pmdefect, session:state.session};
}

function mapDispatchToProps(dispatch) {
  return { actions:bindActionCreators(defectActions,dispatch) };
}

export default connect(mapStateToProps,mapDispatchToProps)(PMDefectContainer);
