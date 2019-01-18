(function(window){
	'use strict';

	if( window.OSP ){
		if( OSP.DataCollection )	return;
	}
	else
		window.OSP = {};
	
	OSP.DataCollection = function(){
		var DataCollection = this; 
		OSP._OpenObject.apply(DataCollection);

		DataCollection.dataType = function( dataTypeName, dataTypeVersion ){
			switch( arguments.length ){
			case 0:
				return DataCollection.property(OSP.Constants.DATA_TYPE);
			default:
				var dataType = {
						name: dataTypeName,
						version: dataTypeVersion
				};
				return DataCollection.property( OSP.Constants.DATA_TYPE, dataType );
			}
		};

		DataCollection.layout = function( layout ){
			return DataCollection.property.apply( DataCollection, OSP.Util.addFirstArgument(OSP.Constants.LAYOUT, arguments) );
		};

		DataCollection.layoutColumnPortlet = function( column, portletId ){
			var layout = DataCollection.layout();
			switch( arguments.length ){
			case 1:
				if( !layout )	return '';
				return layout[column];
			case 2:
				if( !layout ){
					layout = {};
					DataCollection.layout( layout );
				}

				layout[column] = portletId;
				return layout;
			default:
				console.log( 'Arguments count mismatch: layoutColumnPortlet('+arguments.length+')');
				return false;
			}
		};

		DataCollection.removeLayoutColumnPortlet = function( column ){
			var layout = DataCollection.layout();
			if( !layout )	return true;

			return delete layout[column];
		};
	}; /* End of DataCollection */

	OSP.DataEntry = function(){
		var DataEntry = this;
		OSP._MapObject.apply(DataEntry);

		DataEntry.dataCollection = function( collectionName, collectionVersion ){
			switch( arguments.length ){
			case 0:
				return DataEntry.property(OSP.Constants.DATA_COLLECTION);
			default:
				var dataCollection = {
						name: collectionName,
						version: collectionVersion
				};
				return DataEntry.property( OSP.Constants.DATA_COLLECTION, dataCollection );
			}
		};

		DataEntry.scienceApp = function( scienceApp ){
			return DataEntry.property.apply( DataEntry, OSP.Util.addFirstArgument(OSP.Constants.SCIENCE_APP, arguments) );
		};

		DataEntry.inputs = function( inputs ){
			return DataEntry.property.apply( DataEntry, OSP.Util.addFirstArgument(OSP.Constants.INPUTS, arguments) );
		};

		DataEntry.addInput = function( portName, inputData ){
			var inputs = DataEntry.inputs();
			if( ! inputs ){
				inputs = {};
				DataEntry.inputs( inputs );
			}

			inputs[portname] = inputData;
			return inputs;
		};

		DataEntry.inputData = function( portName ){
			var inputs = DataEntry.inputs();
			if( ! inputs )	return false;

			return inputs[portName];
		};

		DataEntry.removeInput = function( portName ){
			var inputs = DataEntry.inputs();
			if( ! inputs )	return true;

			delete inputs[portName];
			return inputs;
		};

		DataEntry.inputData = function( path ){
			return DataEntry.property.apply( DataEntry, OSP.Util.addFirstArgument(OSP.Constants.PATH, arguments) );
		};

		DataEntry.safePath = function(){
			var path = DataEntry.path();
			if( !path ){
				path = new OSP.Path();
				DataEntry.path( path );
			}
			return path;
		};

		DataEntry.setPath = function( parent, name, type, relative ){
			var path = DataEntry.safePath();
			return path.setPath.apply( path, parent, name, type, relative );
		};

		DataEntry.pathParent = function( parent ){
			var path = DataEntry.safePath();
			return path.parent.apply( path, parent );
		};

		DataEntry.pathType = function( type ){
			var path = DataEntry.safePath();
			return path.type.apply(path, type);
		};

		DataEntry.pathName = function( name ){
			var path = DataEntry.safePath();
			return path.name.apply(path, name);
		};

		DataEntry.pathRelative = function( relative ){
			var path = DataEntry.safePath();
			return path.relative.apply(path, relative);
		};

		DataEntry.clone = function(){
			return new OSP.Data( OSP.Util.toJSON(DataEntry) );
		};

		DataEntry.deserializeInputs = function( jsonObject ){
			var inputs = {};
			for( var portName in jsonObject ){
				var path = new OSP.Path( jsonObject[portName] );
				inputs[portName] = path;
			}

			DataEntry.inputs( inputs );
			return inputs;
		};

		DataEntry.deserializePath = function( jsonObject ){
			var path = new OSP.Path( jsonObject );
			DataEntry.path(path);
			return path;
		};
	}; /* End of DataEntry */

	OSP.Workflow = function( jsonObject ){
		var Workflow = this;
		OSP._OpenObject.apply(Workflow);

		var ProceedCondition = function( jsonObject ){
			var PC = this;
			OSP._MapObject.apply(PC);

			PC.comparativeParam = function( param ){
				return PC.property.apply(PC, OSP.Util.addFirstArgument(OSP.Constants.COMPARATIVE_PARAM, arguments));
			};

			PC.comparative = function( operator ){
				return PC.property.apply(PC, OSP.Util.addFirstArgument(OSP.Constants.COMPARATIVE, arguments));
			};

			PC.comparativeValue = function( value ){
				return PC.property.apply(PC, OSP.Util.addFirstArgument(OSP.Constants.COMPARATIVE_VALUE, arguments));
			};

			PC.updates = function( updates ){
				return PC.property.apply(PC, OSP.Util.addFirstArgument(OSP.Constants.UPDATES, arguments));
			};

			PC.safeUpdates = function(){
				var updates = PC.updates();
				if( !updates ){
					updates = {};
					PC.updates(updates);
				}

				return updates;
			};

			PC.addUpdate = function( param, value ){
				var updates = PC.safeUpdates();
				updates[param] = value;

				return updates;
			};

			PC.removeUpdate = function( param ){
				var updates = PC.safeUpdates();
				delete updates[param];

				return updates;
			};

			PC.action = function( action ){
				return PC.property.apply(PC, OSP.Util.addFirstArgument(OSP.Constants.ACTION, arguments));
			};

			PC.check = function( value ){
				if( PC.comparative() === '<' ){
					if( PC.comparativeValue() < value )	return PC.action();
				}
				else if( PC.comparative() === '<=' ){
					if( PC.comparativeValue() <= value )	return PC.action();
				}
				else if( PC.comparative() === '>' ){
					if( PC.comparativeValue() > value )	return PC.action();
				}
				else if( PC.comparative() === '>=' ){
					if( PC.comparativeValue() >= value )	return PC.action();
				}
				else if( PC.comparative() === '=' ){
					if( PC.comparativeValue() == value )	return PC.action();
				}
				else
					return false;
			};

			PC.clone = function(){
				return new ProceedCondition( OSP.Util.toJSON(PC) );
			};

		}; /* End of ProceedCondition */
		Workflow.newProceedCondition = function( jsonObject ){
			switch( arguments.length ){
				case 0:
					return new ProceedCondition();
				case 1:
					return new ProceedCondition(jsonObject);
				default:
					colsole.log( 'Arguments mismatch: newProceedCondition');
					return null;
			}
		};

		var Connection = function( jsonObject ){
			var C = this;
			OSP._MapObject.apply(C);
			OSP._StyleObject.apply(C);

			C.sourcePort = function( portName ){
				return C.property.apply(C, OSP.Util.addFirstArgument(OSP.Constants.SRC_PORT_NAME, arguments));
			};

			C.proceedConditions = function( conditions ){
				return C.property.apply(C, OSP.Util.addFirstArgument(OSP.Constants.PROCEED_CONDITIONS, arguments));
			};

			C.safeProceedConditions = function(){
				var conditions = C.proceedConditions();
				if( !conditions ){
					conditions = [];
					C.proceedConditions(conditions);
				}

				return conditions;
			};

			C.addProceedCondition = function( condition ){
				var conditions = C.safeProceedConditions();
				conditions.push( condition );
				return conditions;
			};

			C.removeProceedCondition = function( param ){
				var conditions = C.proceedConditions();
				if( !conditions )	return true;

				for( var index in conditions ){
					var condition = conditions[index];
					if( condition.comparativeParam() === param ){
						conditions.splice(index, 1);
						break;
					}
				}
				return conditions;
			};

			C.destinationTask = function( taskUuid ){
				return C.property.apply(C, OSP.Util.addFirstArgument(OSP.Constants.TASK_UUID, arguments));
			};

			C.destinationPort = function( portName ){
				return C.property.apply(C, OSP.Util.addFirstArgument(OSP.Constants.DESTINATION_PORT, arguments));
			};


			C.clone = function(){
				return new Connection( OSP.Util.toJSON(C) );
			};

			C.deserialize = function( jsonObject ){
				for( var key in jsonObject ){
					if( key === OSP.Constants.PROCEED_CONDITIONS ){
						var conditionAry = jsonObject[key];
						for( var index in  conditionAry ){
							var condition = new ProceedCondition(conditionAry[index]);
							C.addProceedCondition(condition);
						}
					}
					else
						C.property( key, jsonObject[key] );
				}
			};

			if( arguments.length === 1 )
				C.deserialize(jsonObject);
		}; /* End of Connection */
		Workflow.newConnection = function( jsonObject ){
			switch( arguments.length ){
				case 0:
					return new Connection();
				case 1:
					return new Connection(jsonObject);
				default:
					colsole.log( 'Arguments mismatch: newConnection');
					return null;
			}
		};

		var Task = function( jsonObject ){
			var T = this;
			OSP._OpenObject.apply(T);
			OSP._StyleObject.apply(T);

			T.appUuid = function( uuid ){
				return T.property.apply(T, OSP.Util.addFirstArgument(OSP.Constants.APP_UUID, arguments));
			};

			T.connections = function( connections ){
				return T.property.apply(T, OSP.Util.addFirstArgument(OSP.Constants.CONNECTIONS, arguments));
			};

			T.safeConnections = function(){
				var connections = T.connections();
				if( !connections ){
					connections = [];
					T.connections(connections);
				}

				return connections;
			};

			T.addConnection = function( connection ){
				var connections = T.safeConnections();
				connections.push( connection );
				return connections;
			};

			T.removeConnection = function( srcPort, dstUuid, dstPort ){
				var connections = T.connections();
				if( !connections )	return [];

				for( var index in connections ){
					var connection = connections[index];
					if( connection.sourcePort() === srcPort &&
						 connection.destinationTask() === dstUuid &&
						 connection.destinationPort() === dstPort ){
						 connections.splice( index, 1 );
						break;
					}
				}

				return connections;
			};

			T.inputs = function( inputs ){
				return T.property.apply(T, OSP.Util.addFirstArgument(OSP.Constants.INPUTS, arguments));
			};

			T.safeInputs = function(){
				var inputs = T.inputs();
				if( !inputs ){
					inputs = {};
					T.inputs( inputs );
				}

				return inputs;
			};

			T.inputData = function( portName, input ){
				switch( arguments.length ){
				case 1:
					var inputs = T.inputs();
					if( !inputs )	return false;
					return inputs[portName];
				case 2:
					var inputs = T.inputs();
					if( !inputs ){
						inputs = {};
						T.inputs = inputs;
					}
					inputs[portName] = input;
					return inputs;
				default:
					return false;
				}
			};

			T.removeInputData = function( portName ){
				var inputs = T.inputs();
				if( !inputs )	return true;
				delete inputs[portName];
				return inputs;
			};

			T.clone = function(){
				return new Task( OSP.Util.toJSON(T) );
			};

			T.execute = function(){

			};

			T.deserialize = function( jsonObject ){
				for( var key in jsonObject ){
					if( key === OSP.Constants.CONNECTIONS ){
						var jsonConnections = jsonObject[key];
						for( var index in jsonConnections ){
							T.addConnection( new Connection( jsonConnections[index] ) );
						}
					}
					else
						T.property( key, jsonObject[key] );
				}
			};

			if( arguments.length === 1 )
				T.deserialize(jsonObject);
		}; /* End of Task */
		Workflow.newTask = function( jsonObject ){
			switch( arguments.length ){
				case 0:
					return new Task();
				case 1:
					return new Task(jsonObject);
				default:
					colsole.log( 'Arguments mismatch: newTask');
					return null;
			}
		};
		
		Workflow.tasks = function( tasks ){
			return Workflow.property.apply(Workflow, OSP.Util.addFirstArgument(OSP.Constants.TASKS, arguments));
		};

		Workflow.addTask = function( task ){
			var tasks = Workflow.tasks();
			if( !tasks ){
				tasks = [];
				Workflow.tasks( tasks );
			}

			tasks.push( task );
			return tasks;
		};

		Workflow.removeTask = function( taskUuid ){
			var tasks = Workflow.tasks();
			if( !tasks )	return true;

			for( var index in tasks ){
				var task = tasks[index];
				if( task.uuid() === taskUuid ){
					tasks.splice( index, 1 );
					break;
				}
			}

			return tasks;
		};
		
		Workflow.simulations = function( simulations ){
			return Workflow.property.apply(Workflow, OSP.Util.addFirstArgument(OSP.Constants.SIMULATIONS, arguments));
		};

		Workflow.execute = function(){

		};

		Workflow.clone = function(){
			return new OSP.Workflow( OSP.toJSON(Workflow) );
		};

	}; /* End of Workflow */
	
})(window);