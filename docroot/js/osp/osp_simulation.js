(function(window){
	'use strict';

	if( window.OSP ){
		if( OSP.Simulation )	return;
	}
	else
		window.OSP = {};
	
	OSP.Simulation = function( jsonSimulation ){
		var Simulation = this;
		OSP._OpenObject.apply(Simulation);
		
		var Job = function( jsonJob ){
			var J = this;
			OSP._MapObject.apply( J );
			
			J.uuid = function( uuid ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.UUID, arguments));
			};
			
			J.title = function( title ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.TITLE, arguments));
			};
			
			J.simulationUuid = function( uuid ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.SIMULATION_UUID, arguments));
			};
			
			J.order = function( order ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.ORDER, arguments));
			};
			
			J.status = function( status ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.STATUS, arguments));
			};
			
			J.isSubmit = function( flag ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.SUBMIT, arguments));
			};
			
			J.scienceAppUuid = function( uuid ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.APP_UUID, arguments));
			};
			
			J.inputs = function( inputs ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.INPUTS, arguments));
			};
			
			J.inputData = function( portName, inputData ){
				switch( arguments.length ){
				case 1:
					var inputs = J.inputs();
					if( !inputs )	return false;
					for( var index in inputs ){
						var input = inputs[index];
						if( input.portName() === portName )
							return input;
					}
					break;
				case 2:
					var inputs = J.inputs();
					if( !inputs ){
						inputs = [];
						J.inputs( inputs );
					}
					
					//console.log( inputData.portName()+":"+inputData.order(), inputData);
					var order = inputData.order();
					if( !order ) inputs.push(inputData);
					else{
						if( inputs.length === 0 ){
							inputs.push(inputData);
							return;
						}
						else{
							for(var index in inputs ){
								var input = inputs[index];
								//console.log( 'Input: ', input );
								if( input.order() > inputData.order() ){
									inputs.splice(index, 0, inputData);
									return inputs;
								}
								else if( input.order() === inputData.order() ){
									//console.log('input orders are same: '+input.order());
									inputs.splice( index, 1, inputData );
									return inputs;
								}
							}
							
							inputs.push( inputData );
						}
					}
					return inputs;
				default:
					console.log('[ERROR] Arguments mismatch');
					return false;
				}
			};
			
			J.inputDataDirty = function( portName, dirty ){
				switch( arguments.length ){
					case 1:
						var inputData = J.inputData(portName);
						if( !inputData )	return false;
						return inputData.dirty();
						break;
					case 2:
						var inputData = J.inputData(portName);
						if( !inputData )	return false;
						inputData.dirty(dirty);
						return inputData;
						break;
					default:
						console.log('[ERROR] Argument mis-match.');
						return false;
				}
			};
			
			J.dirty = function( dirty ){
				switch( arguments.length ){
				case 0:
					var inputs = J.inputs();
					if( !inputs )	return false;
					for( var index in inputs ){
						var inputData = inputs[index];
						if( inputData.dirty() )	return true;
					}
					return false;
				case 1:
					var inputs = J.inputs();
					if( !inputs )	return false;
					for( var index in inputs ){
						var inputData = inputs[index];
						inputData.dirty( dirty);
					}
					return dirty;
				default:
					console.log('[ERROR] JOB.dirty() Arguments mismatch.');
				}
			}
			
			J.ppn = function( ppn ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.PROCESSORS_PER_NODE, arguments));
			};
			
			J.ncores = function( ncores ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.NCORES, arguments));
			};
			
			J.cluster = function( cluster ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.CLUSTER, arguments));
			};
			
			J.schedulerUuid = function( uuid ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.SCHEDULER_UUID, arguments));
			};
			
			J.queueName = function( queueName ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.QUEUE_NAME, arguments));
			};
			
			J.nodes = function( nodes ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.NODES, arguments));
			};
			
			J.createTime = function( time ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.CREATE_TIME, arguments));
			};
			
			J.queuedTime = function( time ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.QUEUED_TIME, arguments));
			};
			
			J.startTime = function( time ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.START_TIME, arguments));
			};
			
			J.endTime = function( time ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.END_TIME, arguments));
			};
			
			J.workingDir = function( dir ){
				return J.property.apply(J, OSP.Util.addFirstArgument(OSP.Constants.WORKING_DIR, arguments));
			}
			
			J.getDefaultWorkingDir = function(){
				if( !J.isSubmit() )	return false;
				switch( J.status() ){
				case 'QUEUED':
				case 'RUNNING':
				case 'SUSPEND_REQUESTED':
				case 'SUSPENDED':
				case 'CANCEL_REQUESTED':
				case 'CANCELED':
				case 'SUCCESS':
				case 'FAILED':
					return 'jobs/'+J.simulationUuid()+'/'+J.uuid()+'.job';
				default:
					return false;
				}
			};

			J.clone = function(){
				return new Job( OSP.Util.toJSON( J ) );
			};
			
			J.proliferate = function( portNames ){
				var jobsToSubmit = [];
				if( J.isSubmit() ){
				    var clone = J.clone();
				    clone.isSubmit(false);
				    clone.removeProperty(OSP.Constants.UUID);
				    jobsToSubmit.push( clone );
				}
				else
				    jobsToSubmit.push( J );
				
				for( var index in portNames ){
					var portName = portNames[index];
					//console.log('portName: '+portName);
					var inputData = J.inputData(portName);
					if( !inputData ){
						alert(portName+ ' should not be empty.');
						return false;
					}
					
					//console.log( 'proliferate: ', inputData );
					if( inputData.type() === OSP.Enumeration.PathType.STRUCTURED_DATA ){
					  var dataType = new OSP.DataType();
					  dataType.deserializeStructure(inputData.context());
						var dataStructure = dataType.structure(); 
						var fileContents = dataStructure.activeParameterFormattedInputs();
						//console.log( 'fileContent: ', fileContents );
						if( fileContents.length === 1 ){
							for( var jobIndex in jobsToSubmit ){
								var job = jobsToSubmit[jobIndex];
								var data = new OSP.InputData();
								data.portName( inputData.portName() );
								data.order( inputData.order() );
								data.type( OSP.Enumeration.PathType.FILE_CONTENT );
								data.context( fileContents[0].join('') );
								job.inputData( portName, data );
							}
						}
						else{
							var proliferatedJobs = [];
							for( var fileIndex = 0; fileIndex<fileContents.length; fileIndex++){
								var jsonCloneJobs = JSON.parse(JSON.stringify(jobsToSubmit));
								var cloneJobs = [];
								for( var cloneIndex in jsonCloneJobs ){
									var cloneJob = new Job( jsonCloneJobs[cloneIndex] );
									var data = new OSP.InputData();
									data.portName( inputData.portName() );
									data.order( inputData.order() );
									data.type( OSP.Enumeration.PathType.FILE_CONTENT );
									data.context( fileContents[fileIndex].join('') );
									cloneJob.inputData( portName, data );
									cloneJobs.push(cloneJob);
								}
								proliferatedJobs = proliferatedJobs.concat( cloneJobs );
							}
							
							jobsToSubmit = proliferatedJobs;
						}
					}
					else{
						//console.log('portName: '+portName);
						for( var jobIndex in jobsToSubmit ){
							//console.log('jobIndex: '+jobIndex);
							var job = jobsToSubmit[jobIndex];
							job.inputData( portName, inputData.clone() );
						}
					}
				}
				//console.log( 'jobsToSubmit', jobsToSubmit);
				return jobsToSubmit;
			};
			
			J.toDTO = function(){
				var dto = {};
				
				dto[OSP.Constants.UUID] = J.uuid();
				dto[OSP.Constants.TITLE] = J.title();
				dto[OSP.Constants.SIMULATION_UUID] = J.simulationUuid();
				dto[OSP.Constants.PROCESSORS_PER_NODE] = J.ppn() ? J.ppn() : 1;
				dto[OSP.Constants.NODES] =  J.nodes() ? J.nodes() : 1;
				dto[OSP.Constants.NCORES] =  J.ncores() ? J.ncores() : J.ppn() * J.nodes();
				dto[OSP.Constants.STATUS] =  J.status();
				dto[OSP.Constants.SUBMIT] = J.isSubmit();
				
				if( J.inputs() )
					dto[OSP.Constants.INPUTS] =  J.inputs();
				
				return dto;
			};
			
			J.deserialize = function( jsonJob ){
				for( var key in jsonJob ){
					switch( key ){
						case OSP.Constants.UUID:
						case OSP.Constants.TITLE:
						case OSP.Constants.SIMULATION_UUID:
						case OSP.Constants.PROCESSORS_PER_NODE:
						case OSP.Constants.NODES:
						case OSP.Constants.NCORES:
						case OSP.Constants.START_TIME:
						case OSP.Constants.END_TIME:
						case OSP.Constants.STATUS:
						case OSP.Constants.SUBMIT:
							J.property( key, jsonJob[key] );
							break;
						case OSP.Constants.INPUTS:
							var jsonInputs = jsonJob[key];
							for( var index in jsonInputs ){
								var jsonInputData = jsonInputs[index];
								J.inputData(jsonInputData[OSP.Constants.PORT_NAME], new OSP.InputData( jsonInputData ) );
							}
							break;
						default:
							console.log('[ERROR] Job.deserialize(). unrecogizable key: '+key);
					}
				}
			};
			
			if( arguments.length === 1 )
				J.deserialize( jsonJob );
		}; /* End of Job */
		Simulation.newJob = function( jsonJob ){
			return new Job( jsonJob );
		};

		Simulation.scienceAppId = function( scienceAppId ){
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.SCIENCE_APP_ID, arguments));
		};
		
		Simulation.scienceAppName = function( scienceAppName ){
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.SCIENCE_APP_NAME, arguments));
		};
		
		Simulation.scienceAppVersion = function( scienceAppVersion ){
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.SCIENCE_APP_VERSION, arguments));
		};
		
		Simulation.cluster = function( cluster ){
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.CLUSTER, arguments));
		};

		Simulation.createTime = function( date ){
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.CREATE_TIME, arguments));
		};
		
		Simulation.jobs = function( jobs ){
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.JOBS, arguments));
		};
		
		Simulation.ncores = function( ncores ){
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.NCORES, arguments));
		};
		
		Simulation.runType = function( runType ){
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.RUNTYPE, arguments));
		};
		
		Simulation.addJob = function( job ){
			var jobs = Simulation.jobs();
			if( !jobs ){
				jobs = {};
				Simulation.jobs( jobs );
			}
			
			jobs[job.uuid()] = job;
			
			return jobs;
		};
		
		Simulation.removeJob = function( uuid ){
			var jobs = Simulation.jobs();
			if( !jobs )		return false;
			
			for( var uuid in jobs ){
				var job = jobs[uuid];
				if( job.uuid() === uuid ){
					var workingJob = Simulation.workingJob();
					if( workingJob && workingJob.uuid() === uuid ){
						Simulation.removeProperty( OSP.Constants.WORKING_JOB );
					}
					OSP.Util.removeArrayElement(jobs, uuid);
					return jobs;
				}
			}
			
			return false;
		};
		
		Simulation.getJob = function( uuid ){
			var jobs = Simulation.jobs();
			if( !jobs )		return false;
			
			return jobs[uuid];
		};
		
		Simulation.getJobOutputFolder = function( job ){
		    if( !job.isSubmit() ) return false;
		    
		    return Simulation.uuid() + '/' + job.uuid() + '.job';
		}
		
		Simulation.countJobs = function(){
			var jobs = Simulation.jobs();
			if( !jobs )		return 0;
			else		return jobs.length;
		};
		
		Simulation.workingJob = function( job ){
			//console.log( 'Seeting Working Job', job);
			return Simulation.property.apply(Simulation, OSP.Util.addFirstArgument(OSP.Constants.WORKING_JOB, arguments));
		};
		
		Simulation.getDefaultTitle = function( prefix, now ){
			return prefix+'-'+now.toString();
		};
		
		Simulation.checkDirty = function(){
			var jobs = Simulation.jobs();
			for( var uuid in jobs ){
				var job = jobs[uuid];
				if( job.dirty() )
					return true;
			}
			
			return false; 
		};
		
		Simulation.getDirtyJobs = function(){
			var jobs = Simulation.jobs();
			var dirtyJobs = [];
			for( var uuid in jobs ){
				var job = jobs[uuid];
				if( job.dirty() )
					dirtyJobs.push(job);
			}
			
			return dirtyJobs;
		};
		
		Simulation.clone = function(){
			return new OSP.Simulation( OSP.toJSON(Simulation) );
		};
		
		Simulation.toDTO = function(){
			var jobs = Simulation.jobs();
			var jobsDTO;
			if( jobs ){
				jobsDTO = {};
				for( var uuid in jobs ){
					var job = jobs[uuid];
					jobsDTO[uuid] = job.toDTO();
				}
			}
			
			var dto = {};
			
			dto[OSP.Constants.UUID] = Simulation.uuid();
			dto[OSP.Constants.TITLE] = Simulation.title();
			dto[OSP.Constants.SCIENCE_APP_ID] = Simulation.scienceAppId();
			dto[OSP.Constants.SCIENCE_APP_NAME] = Simulation.scienceAppName();
			dto[OSP.Constants.SCIENCE_APP_VERSION] = Simulation.scienceAppVersion();
			dto[OSP.Constants.JOBS] = jobsDTO;
			
			return dto;
		};
		
		Simulation.deserialize = function( jsonSimulation ){
			for( var key in jsonSimulation ){
				var value = jsonSimulation[key];
				
				switch( key ){
					case OSP.Constants.SCIENCE_APP_ID:
					case OSP.Constants.SCIENCE_APP_NAME:
					case OSP.Constants.CLUSTER:
						Simulation.property( key, value );
						break;
					case OSP.Constants.JOBS:
						var jobs = {};
						var jsonJobs = jsonSimulation[key];
						var index = 0;
						for(var uuid in jsonJobs ){
							var job = Simulation.newJob(jsonJobs[uuid]);
							Simulation.addJob( job );
							if( index === 0 )
								Simulation.workingJob(job);
							index++;
						}
						Simulation.jobs( jobs );
						
						break;
					default:
						Simulation._deserialize( key, value );
				}
			}
		}
		
		if( arguments.length === 1 )
			Simulation.deserialize( jsonSimulation );
	}; /* End of Simulation */
	
})(window);