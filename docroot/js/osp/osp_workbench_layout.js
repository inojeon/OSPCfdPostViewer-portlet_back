(function(window){
	'use strict';

	if( window.OSP ){
		if( OSP.Layout )	return;
	}
	else
		window.OSP = {};
	
	OSP.Layout = function( jsonLayout ){
		var Layout = this;
		OSP._MapObject.apply( Layout );

		var Portlet = function( jsonPortlet ){
			var P = this;
			OSP._MapObject.apply(P);

			P.instanceId = function( instanceId ){
				return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.INSTANCE_ID, arguments));
			};
			
			P.portName = function( portName ){
				if( portName === '' )	return false;
				return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.PORT_NAME, arguments));
			};
			
			P.portType = function( type ){
			    return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.TYPE, arguments));
			};

			P.generateInstanceId = function( instanceIndex ){
				var instanceId = P.instanceId();
				if( instanceId.indexOf('_INSTANCE_') > 0)
					instanceId = instanceId.slice(0, instanceId.indexOf('_INSTANCE_'));
				
				var instanceString;
				var idStr = "" + instanceIndex;
				var pad = "0000";
				var instanceString = pad.substring(0, pad.length - idStr.length) + idStr;
				P.instanceId(instanceId+'_INSTANCE_'+instanceString);
				
				return P.instanceId();
			};
			
			P.getRootId = function(){
				var instanceId = P.instanceId();
				var index = instanceId.indexOf('_INSTANCE_');
				if( index < 0 )
					return instanceId;
				else
					return instanceId.slice(0, instanceId.indexOf('_INSTANCE_'));
			};

			P.getNamespace = function(){
				return '_'+P.instanceId()+'_';
			};

			P.data = function( data ){
				return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.DATA, arguments));
			};
			
			P.status = function( status ){
				return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.STATUS, arguments));
			};

			P.preferences = function( preferences ){
				return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.PREFERENCES, arguments));
			};
			
			P.eventEnable = function( eventEnable ){
				return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.EVENT_ENABLE, arguments));
			};

			P.windowState = function( windowState ){
				return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.WINDOW_STATE, arguments));
			};

			P.addPreference = function( key, value ){
				var preferences = P.preferences();
				switch( arguments.length){
				case 1:
					if( !preferences )	return '';
					return preferences[key];
				case 2:
					if( !preferences ){
						preferences = [];
						P.preferences( preferences );
					}
					return preferences[key] = value;
				default:
					console.log( 'Arguments mismatch: Portlet.preference.');
					return false;
				}
			};

			P.removePreference = function( preference ){
				var preferences = P.preferences();
				if( !preferences )	return true;
				return delete preferences[preference];
			};
			
			P.events = function( events ){
				return P.property.apply(P, OSP.Util.addFirstArgument(OSP.Constants.EVENTS, arguments));
			};
			
			P.checkEvent = function( event ){
				var events = P.events();
				if( !events )	return false;
				
				for( var index in events ){
					if( event === events[index] )
						return true;
				}
				
				return false;
			};
			
			P.display = function( displayOption ){
				var $portletDiv = $('#'+P.getNamespace());
				if( $portletDiv.length > 0 ){
					$portletDiv.css('display', displayOption);
					return true;
				}
				else
					return false;
			};
			
			P.load = function( $targetDiv, connector, eventEnable, windowState, callback ){
				AUI().use('liferay-portlet-url', function(A){
					var portletURL = Liferay.PortletURL.createRenderURL();
					portletURL.setPortletId( P.instanceId() );
					portletURL.setParameter( 'eventEnable', eventEnable);
					portletURL.setParameter( 'connector', connector);
					portletURL.setParameter( 'action', P.portType());
					portletURL.setWindowState(windowState);

					$.ajax({
						url: portletURL.toString(),
						type:'POST',
						async: false,
						dataType:'text',
						success: function( renderResult ){
							var $portletDiv = $('<div>');
							$portletDiv.attr('id', P.getNamespace());
							$portletDiv.css( 'height', 'inherit');
							$portletDiv.html( renderResult );
							$targetDiv.append( $portletDiv );
							callback( connector, P.instanceId() );
						},
						error: function(){
							console.log('AJAX loading failed', P);
						}
					});
				}); 
			};
			
			P.fire = function( event, source, data ){
				if( !P.checkEvent(event) )
					return false;
				
				var eventData = {
						portletId: source,
						targetPortlet: P.instanceId(),
						data: data
				};
				
				Liferay.fire( event, eventData);
			};
			
			P.loadData = function( connector ){
				var data = P.data();
				if( !data )	return false;
				
				P.fire( OSP.Event.OSP_LOAD_DATA, connector, data );
			};

			P.clone = function(){
				return new Portlet( OSP.Util.toJSON(P) );
			};

			P.deserialize = function( jsonPortlet ){
				for( var key in jsonPortlet ){
					switch( key ){
					case OSP.Constants.INSTANCE_ID:
					case OSP.Constants.PREFERENCES:
					case OSP.Constants.PORT_NAME:
					case OSP.Constants.DATA:
						P.property( key, jsonPortlet[key] );
						break;
					default:
						console.log( 'Un-recognizable Portlet property: '+key);
					}
				}
			};

			if( arguments.length === 1 )
				P.deserialize( jsonPortlet );
		}; // End of Portlet
		Layout.newPortlet = function(jsonPortlet ){
			return new Portlet(jsonPortlet);
		};
		
		var Column = function( jsonColumn ){
			var C = this;
			OSP._MapObject.apply(C);
			
			// Column Definitions
			C.id = function( id ){
				return C.property.apply(C, OSP.Util.addFirstArgument(OSP.Constants.ID, arguments));
			};
			
			C.height = function( height ){
				return C.property.apply(C, OSP.Util.addFirstArgument(OSP.Constants.HEIGHT, arguments));
			};
			
			C.currentPortlet = function( instanceId ){
				return C.property.apply(C, OSP.Util.addFirstArgument(OSP.Constants.CURRENT_PORTLET, arguments));
			};
			
			C.getVisualPortlet = function(){
				return C.getPortlet( C.currentPortlet() );
			};

			C.portlets = function( portlets ){
				return C.property.apply(C, OSP.Util.addFirstArgument(OSP.Constants.PORTLETS, arguments));
			};
			
			C.getPortlet = function( instanceId /* or port name */){
				var portlets  = C.portlets();
				if( !portlets )	false;
				
				var portName = instanceId;
				for( var index in portlets ){
					var portlet = portlets[index];
					if( instanceId === portlet.instanceId() || portName === portlet.portName() )
						return portlet;
				}
				return false;
			};
			
			C.addPortlet = function( portlet ){
				var portlets = C.portlets();
				if( !portlets ){
					portlets = [];
					C.portlets(portlets);
				}

				var portName = portlet.portName();
				
				for( var index in portlets ){
					var savedPortlet = portlets[index];
					if( portlet.instanceId() === savedPortlet.instanceId() ){
						console.log('ERROR]portlet is already assigned to the column: '+portlet.instanceId());
						return false;
					}
					else if( portlet.portName() && portlet.portName() === savedPortlet.portName() ){
						savedPortlet.instanceId( portlet.instanceId() );
						var preferences = portlet.preferences();
						if( preferences ){
							savedPortlet.preferences(preferences);
							return portlets;
						}
					}
				}
				
				portlets.push(portlet);
				
				return portlets;
			};
			
			C.getAssignedPortNames = function(){
				var portlets = C.portlets();
				if( !portlets ){
					console.log('[ERROR]no AssignedPorts to getAssignedPortNames');
					return false;
				}
				
				var portNames = [];
				for( var index in portlets ){
					var portlet = portlets[index];
					if( portlet.portName() && portlet.portName() !== '' )
						portNames.push(portlet.portName());
				}
				
				return portNames;
			};
			
			// if portName is a portlet id, then specified connection removed also
			var removePortlet = function( instanceId /* or port name */){
				var portlets = C.portlets();
				if( !portlets ){
					console.log('[ERROR]no portlets to be removed: '+portlerId);
					return false;
				}
				var portName = instanceId;
				
				for( var index in portlets ){
					var portlet = portlets[index];
					if( portName === portlet.portName() || instanceId === portlet.instanceId()){
						OSP.Util.removeArrayElement(portlets, index);
						return portlets;
					}
				}
				
				return false;
			};
			
			C.isAssigned = function( portName /* or portlet instance id */ ){
				var portlets = C.portlets();
				if( !portlets ){
					return false;
				}
				
				var instanceId = portName;
				for( var index in portlets ){
					var portlet = portlets[index];
					if( portName === portlet.portName() || instanceId === portlet.instanceId() ){
						return true;
					}
				}
				return false;
			};
			
			C.getAssignedPortName = function( instanceId ){
				var portlets = C.portlets();
				if( !portlets )	return false;
				
				for( var index in portlets ){
					var portlet = portlets[index];
					if( instanceId === portlet.instanceId() )
						return portlet.portName();
				}
				
				return false;
			};
			
			C.loadPortlet = function( targetPortlet, connector, eventEnable, windowState, callback ){
				//console.log( 'Target Portlet ID: '+portletId);
				if( targetPortlet.status() ){
					targetPortlet.display( 'block' );
					return true;
				}
				
				targetPortlet.status( true );
				
				var $targetDiv = $('#'+C.getPortletSectionId(connector));
				targetPortlet.load( $targetDiv, connector, eventEnable, windowState, callback );
			};
			
			C.loadData = function( instanceId/* or portName*/, connector ){
				var portlet = C.getPortlet(instanceId);
				if( !portlet )	return false;
				return portlet.loadData( connector );
			};

			C.switchDisplayPortlet = function( targetPortlet, connector, eventEnable, windowState, callback){
				var currentPortletId = C.currentPortlet();
				if( !currentPortletId )	return false;
				var currentPortlet = C.getPortlet( currentPortletId );
				currentPortlet.display( 'none' );

				var $targetDiv = $('#'+C.getPortletSectionId(connector));
				C.loadPortlet( targetPortlet, connector, eventEnable, windowState, callback);
				
				C.currentPortlet(targetPortlet.instanceId());
			};
			
			C.getPortletSectionId = function( callerId ){
					return OSP.Event.getNamespace(callerId)+C.id();
			};
			
			C.fire = function( event, source, data ){
				var portlets = C.portlets();
				if( !portlets )	return false;
				
				for( var index in portlets ){
					var portlet = portlets[index];
					portlet.fire( event, source, data);
				}
				
				return true;
			};
			
			C.clone = function(){
				return new Column( OSP.Util.toJSON(C) );
			};

			C.deserialize = function( jsonColumn ){
				for( var key in jsonColumn ){
					switch( key ){
					case OSP.Constants.ID:
					case OSP.Constants.HEIGHT:
					case OSP.Constants.CURRENT_PORTLET:
						C.property( key, jsonColumn[key] );
						break;
					case OSP.Constants.PORTLETS:
						var jsonPortlets = jsonColumn[key];
						for( var index in jsonPortlets ){
							C.addPortlet( new Portlet(jsonPortlets[index]) );
						}
						break;
					default:
						console.log( 'Un-recognizable Portlet property: '+key);
					}
				}
			};
			
			if( arguments.length === 1 )
				C.deserialize( jsonColumn );
			
		}; /* End of Column */
		Layout.newColumn = function( jsonColumn ){
			return new Column( jsonColumn );
		};
		
		Layout.templateId = function( templateId ){
			return Layout.property.apply(Layout, OSP.Util.addFirstArgument(OSP.Constants.TEMPLATE_ID, arguments));
		};
		
		Layout.workbenchId = function( workbenchId ){
			return Layout.property.apply(Layout, OSP.Util.addFirstArgument(OSP.Constants.WORKBENCH_ID, arguments));
		};
		
		Layout.height = function( templateId ){
			return Layout.property.apply(Layout, OSP.Util.addFirstArgument(OSP.Constants.HEIGHT, arguments));
		};

		Layout.columns = function( columns ){
			return Layout.property.apply(Layout, OSP.Util.addFirstArgument(OSP.Constants.COLUMNS, arguments));
		};

		Layout.getColumnIds = function(){
			var columns = Layout.columns();
			if( !columns )	return [];
			
			var columnIds = [];
			for( var index in columns ){
				var column = columns[index];
				columnids.push( column.id() );
			}
			return columnIds;
		};

		Layout.getPortlet = function( instanceId /* or port name */ ){
			var columns = Layout.columns();
			if( !columns ){
				console.log('[ERROR]there is no columns to be searched: ');
				return false;
			}
			var portName = instanceId;

			for( var index in columns ){
				var column  = columns[index];
				
				if( column.isAssigned( portName ) )
					return column.getPortlet(instanceId);
			}
			return false;
		};
		
		Layout.addColumn = function( column ){
			var columns = Layout.columns();
			if( !columns ){
				columns = [];
				Layout.columns(columns);
			} 
			
			columns.push(column);
			return columns;
		};

		Layout.getColumn = function( columnId /* or port name or instance id */ ){
			var columns = Layout.columns();
			if( !columns )	return false;
			
			var instanceId = columnId;
			
			for( var index in columns ){
				var column = columns[index];
				if( column.id() === columnId )
					return column;
				else{
					if( column.isAssigned(instanceId) ){
						return column;
					}
				}
			}
			
			return false;
		};
		
		Layout.getVisualPortlet = function( portName ){
			var column = Layout.getColumn(portName);
			return column.getVisualPortlet();
		};
		
		Layout.getAssignedPortName = function( portletId ){
			var columns = Layout.columns();
			if( !columns )	return false;
			
			for( var index in columns ){
				var column = columns[index];
				var portName = column.getAssignedPortName( portletId );
				if( portName != false )
					return portName;
			}
			
			return false;
		};
		
		Layout.removeColumn = function( columnId ){
			var columns = Layout.columns();
			if( !columns )	return true;
			
			for( var index in columns ){
				var column = columns[index];
				if( column.id() === columnId )
					return OSP.Util.removeArrayElement(columns, index);
			}
			
			return false;
		};
		
		Layout.hasPortlet = function( instanceId ){
			var columns = Layout.columns();
			if( !columns )	return [];
			
			for( var index in columns ){
				var column = columns[index];
				if( column.isAssigned(instanceId) === true )
					return true;
			}
			
			return false;
		};
		
		var retriveRootPortlets = function( rootPortletId ){
			var columns = Layout.columns();
			if( !columns )	return [];
			
			var retrieved = [];
			for( var index in columns ){
				var column = columns[index];
				var portlets = column.portlets();
				for( var idx in portlets ){
					var portlet = portlets[idx];
					if( portlet.getRootId() === rootPortletId )
						retrieved.push(portlet);
				}
			}
			
			return retrieved;
		};
		
		Layout.addPortlet = function( columnId, rootId, display, portName, preferences ){
			var column = Layout.getColumn(columnId);
			if( !column ){
				column = new Column();
				column.id(columnId);
				Layout.addColumn(column);
			}
			
			var portlet = new Portlet();
			portlet.instanceId(rootId);
			if( portName )	portlet.portName(portName);
			if( preferences )	portlet.preferences( preferences );
			var retrievedPortlets = retriveRootPortlets(rootId);
			switch( retrievedPortlets.length ){
				case 0:
					column.addPortlet( portlet );
					if( display )
						column.currentPortlet(portlet.instanceId());
					return column;
				case 1:
					var prevId = retrievedPortlets[0].instanceId();
					var prevColumn = Layout.getColumn(prevId);
					retrievedPortlets[0].generateInstanceId( 1 );
					if( prevId === prevColumn.currentPortlet() )
						prevColumn.currentPortlet( retrievedPortlets[0].instanceId() );
					
					portlet.generateInstanceId( 2 );
					column.addPortlet(portlet);
					if( display )
						column.currentPortlet(portlet.instanceId());
					return column;
				default:
					var instanceIndex = 1;
					var duplicated = false;
					do{
						for( var index in retrievedPortlets ){
							portlet.generateInstanceId(instanceIndex);
							if( retrievedPortlets[index].instanceId() === portlet.instanceId() ){
								duplicated = true;
								instanceIndex++;
							}
							else
								duplicated = false;
						}
					}while( duplicated );

					column.addPortlet(portlet);
					if( display )
						column.currentPortlet(portlet.instanceId());
					return column;
			}
		};
		
		Layout.removeColumn = function( columnId ){
			var columns = Layout.columns();
			
			for( var index in columns ){
				var column = columns[index];
				if( columnId === column.id() )
					return OSP.Util.removeArrayElement(columns, index);
			}

			return false;
		};

		Layout.removeColumnPortlet = function( columnId, portletId /* or port name */){
			var column = Layout.column(columnId);
			if( !column ){
				console.log( "[ERROR]column does not exist: "+columnId);
				return false;
			}
			
			return column.removePortlet(portletId);
		};

		Layout.loadPortlets = function( scienceApp, workbenchId, eventEnable, windowState, callback ){
			var columns = Layout.columns();
			if( !columns )	return false;
				
			for( var index in columns ){
				var column = columns[index];
				//console.log('current column: ', column);
				var portletId = column.currentPortlet();
				var targetPortlet;
				if( !portletId ){
					targetPortlet = column.getPortlet('_DOWNLOAD_');
					column.currentPortlet( targetPortlet.instanceId() );
				}
				else{
					targetPortlet = column.getPortlet(portletId);
					var portName = targetPortlet.portName();
					if( portName ){
						var portType = scienceApp.getPortType( portName );

						targetPortlet.portType( portType );
					}
				}
				
				column.loadPortlet( 
							targetPortlet, 
							workbenchId, 
							eventEnable,
							windowState,
							callback 
				);
			}
		};
		
		Layout.loadData = function( instanceId /* or portName */, connector ){
			var portlet = Layout.getPortlet(instanceId);
			if( !portlet )	return false;
			
			return portlet.loadData();
		};
		
		Layout.switchDisplayColumnPortlet = function( portType, toPortletId /* or port name */, connector, eventEnable, windowState, callback ){
			var column = Layout.getColumn(toPortletId);
			if( !column ){
				console.log('[ERROR]no column: '+toPortletId);
				return false;
			}
			
			//console.log( 'Column: ', column );
			var targetPortlet = Layout.getPortlet(toPortletId);
            var portName = targetPortlet.portName();
            if( portName ){
                targetPortlet.portType(portType);
            }

			return column.switchDisplayPortlet(targetPortlet, connector, eventEnable, windowState, callback);
		};

		Layout.getPortletSectionId = function( namespace, instanceId /* or port name */ ){
			var column = Layout.getColumn( instanceId );
			if( !column ){
				console.log('[ERROR]no columns for: '+instanceId);
				return false;
			}
			
			return column.getPortletSectionId(namespace);
		};
		
		Layout.registerEvents = function( instanceId, events ){
			var portlet = Layout.getPortlet(instanceId);
			if( !portlet )	return false;
			
			return portlet.events( events );
		};
		
		Layout.fire = function( event, source, data ){
			var columns = Layout.columns();
			if( !columns )	return false;
			
			for( var index in columns ){
				var column = columns[index];
				column.fire(event, source, data);
			}
		};
		
		Layout.checkVisual = function( portName /* or portlet instance ID */){
			var column = Layout.getColumn(portName);
			var portlet = column.getPortlet( portName );
			
			if( column.currentPortlet() === portlet.instanceId() )
				return true;
			else
				return false;
		};
		
		Layout.clone = function(){
			return new OSP.Layout( OSP.Util.toJSON(Layout) );
		};

		Layout.deserialize = function( jsonLayout ){
			for( var key in jsonLayout ){
				switch( key ){
					case OSP.Constants.TEMPLATE_ID:
					case OSP.Constants.HEIGHT:
						Layout.property( key, jsonLayout[key] );
						break;
					case OSP.Constants.COLUMNS:
						var columnsJson = jsonLayout[key];
						var columns = [];
						for( var index in columnsJson ){
							var column = new Column( columnsJson[index] );
							columns.push(column);
						}
						Layout.columns(columns);
						break;
					default:
						console.log("Un-recognizable key: "+ key);
				}
			}
		};
		
		if( arguments.length === 1 )
			Layout.deserialize( jsonLayout );
		
		//return Layout;
	}; // End of Layout
	OSP.newLayout = function( jsonLayout ){
		return new OSP.Layout( jsonLayout );
	};
	
	OSP.Workbench = function( jsonWorkbench ){
		var Workbench = this;
		OSP._MapObject.apply( Workbench );
		
		Workbench.layout = function( layout ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.LAYOUT, arguments));
		};
		
		Workbench.workingSimulation = function( simulation ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.WORKING_SIMULATION, arguments));
		};
		
		Workbench.simulations = function( simulations ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.SIMULATIONS, arguments));
		};
		
		Workbench.addSimulation = function( simulation ){
			var simulations = Workbench.simulations();
			if( !simulations ){
				simulations = {};
				Workbench.simulations( simulations );
			}
			
			simulations[simulation.uuid()] = simulation;
			
			return simulations;
		};
		
		Workbench.removeSimulation = function( simulationUuid ){
			var simulations = Workbench.simulations();
			if( !simulations )		return false;
			
			if( simulationUuid === this.workingSimulation().uuid() )
				delete Workbench[OSP.Constants.WORKING_SIMULATION];
			
			delete simulations[simulationUuid];
		};
		
		Workbench.getSimulation = function( simulationUuid ){
			var simulations = Workbench.simulations();
			if( !simulations )		return false;
			
			return simulations[simulationUuid];
		};
		
		Workbench.newSimulation = function( jsonSimulation ){
			return  new OSP.Simulation( jsonSimulation );
		};
		
		Workbench.scienceApp = function( scienceApp ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.SCIENCE_APP, arguments));
		};
		
		Workbench.type = function( type ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.TYPE, arguments));
		};
		
		Workbench.id = function( id ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.ID, arguments));
		};
		
		Workbench.classId = function( classId ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.CLASS_ID, arguments));
		};
		
		Workbench.customId = function( customId ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.CUSTOM_ID, arguments));
		};
		
		Workbench.loadPortlets = function( eventEnable, windowState, callback ){
			var layout = Workbench.layout();
			if( !layout )		return false;
			//console.log('Workbench Layout: ', layout );
			
			layout.loadPortlets( Workbench.scienceApp(), Workbench.id(), eventEnable, windowState, callback );
		};
		
		Workbench.getPortlet = function( portletId /* or portName */){
			var layout = Workbench.layout();
			if( !layout )		return false;
			
			return layout.getPortlet( portletId );
		};
		
		Workbench.registerEvents = function( portletId, events ){
			var layout = Workbench.layout();
			if( !layout )		return false;
			
			var portlet = layout.getPortlet( portletId );
			return portlet.events( events );
		};
		
		Workbench.getWorkingJobInputs = function(){
			var job = Workbench.workingJob();
			return job.inputs();
		};
		
		Workbench.simulationStatus = function( simulationUuid, status ){
			var simulation = Workbench.getSimulation(simulationUuid);
			
			switch( arguments.length ){
			case 1:
				return simulation.status();
			case 2:
				return simulation.status( status );
			default:
				console.log('[ERROR] Arguments mis-match.');
				return false;
			}
		};
		
		Workbench.fire = function( event, targetPortletId, data ){
			var layout = Workbench.layout();
			if( !layout )	return false;
			
			var portlet = layout.getPortlet( targetPortletId );
			return portlet.fire( event, Workbench.id(), data );
		};
		
		Workbench.fireRefresh = function(){
			var layout = Workbench.layout();
			if( !layout )	return false;
			
			layout.fire( 
					OSP.Event.OSP_REFRESH, 
					{
						portletId: Workbench.id(),
						targetPortlet: 'BROADCAST'
					}
			);
		};
		
		Workbench.simulationMonitorPortlet = function ( monitorId ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.SIMULATION_MONITOR_PORTLET, arguments));
		};
		
		Workbench.jobMonitorPortlet = function( monitorId ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.JOB_MONITOR_PORTLET, arguments));
		};
		
		Workbench.dashboardPortlet = function( dashboardId ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.DASHBOARD_PORTLET, arguments));
		};
		
		Workbench.jobStatusPortlet = function( jobStatusPortletId ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.JOB_STATUS_PORTLET, arguments));
		};
		
		Workbench.scienceAppInfoPortlet = function( portletId ){
			return Workbench.property.apply(Workbench, OSP.Util.addFirstArgument(OSP.Constants.SCIENCE_APP_INFO_PORTLET, arguments));
		};
		
		Workbench.print = function( msg ){
			console.log( '***** '+msg+' *****');
			console.log( Workbench);
		};
	}; /* End of Workbench */
	
})(window);