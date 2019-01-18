(function(window){
	'use strict';

	if( window.OSP ){
		if( OSP.ScienceApp )	return;
	}
	else
		window.OSP = {};

	OSP.ScienceApp = function(){
		var ScienceApp = this;
		OSP._OpenObject.apply(ScienceApp);

		var _Port = function( jsonObject ){
			var _P = this;
			OSP._MapObject.apply(_P);

			_P.name = function( name ){
				if( !_P.verifyName(name) )	return false;

				return _P.property.apply(_P, OSP.Util.addFirstArgument(OSP.Constants.NAME, arguments));
			};

			_P.mandatory = function( mandatory ){
				return _P.property.apply(_P, OSP.Util.addFirstArgument(OSP.Constants.MANDATORY, arguments));
			};

			_P.dataType = function( dataTypeName, dataTypeVersion ){
				switch( arguments.length ){
				case 0:
					return _P.property(OSP.Constants.DATA_TYPE);
				case 1:
					return _P.property(OSP.Constants.DATA_TYPE, dataTypeName);
				case 2:
					var dataType = {
						name: dataTypeName,
						version: dataTypeVersion
					};
					return _P.property(OSP.Constants.DATA_TYPE, dataType);
				default:
					return false;
				}
			};
			
			_P.status = function( status ){
				return _P.property.apply(_P, OSP.Util.addFirstArgument(OSP.Constants.STATUS, arguments));
			};

			_P.defaultEditor = function( scienceApp ){
				return _P.property.apply(_P, OSP.Util.addFirstArgument(OSP.Constants.DEFAULT_EDITOR, arguments));
			};

			_P.defaultAnalyzer = function( scienceApp ){
				return _P.property.apply(_P, OSP.Util.addFirstArgument(OSP.Constants.DEFAULT_ANALYZER, arguments));
			};

			_P.getAvailableEditors = function( url, params ){

			};

			_P.getAvailableAnalyzers = function( url, params ){

			};
			
			_P.displayName = function( displayName ){
				return _P.property.apply( _P, OSP.Util.addFirstArgument(OSP.Constants.DISPLAY_NAME, arguments) );
			};
			
			_P.localizedName = function( languageId, text ){
				var displayName = OpenObject.displayName();

				switch( arguemnts.length ){
					case 1:
						if( !displayName )	return '';
						return displayName[languageId];
					case 2:
						if( !displayName ){
							displayName = {};
							_P.displayName( displayName );
						}
						return displayName[languageId] = text;
					default:
						console.log( 'localizedTitle(): argument count mismatch('+arguments.length+')');
						return false;
				}
			};

			_P.removeLocalizedName = function( languageId ){
				var displayName = _P.displayName();
				if( !displayName )	return true;

				return delete displayName[languageId];
			};

			_P.toNameXml = function( availableLanguageIds, defaultLanguageId ){
				var displayName = _P.displayName();
				if( !displayName )	displayName = {};
				return OSP.Util.toLocalizedXml( displayName, availableLanguageIds, defaultLanguageId );
			};

			_P.verifyName = function(name){
				if( !name )	return true;
				if(!/^[-|_]?[a-zA-Z0-9_]+$/.test(name))  return false;
				else  return true;
			};
		}; // End of _Port

		var InputPort = function( jsonObject ){
			var IP = this;
			_Port.apply(IP);
			
			IP.order = function( order ) {
				return IP.property.apply(IP, OSP.Util.addFirstArgument(OSP.Constants.ORDER, arguments));
			};

			IP.sample = function( samplePath ){
				return IP.property.apply(IP, OSP.Util.addFirstArgument(OSP.Constants.SAMPLE, arguments));
			};
			
			IP.deleteSample = function(){
				IP.removeProperty(OSP.Constants.SAMPLE);
			};

			IP.samplePath = function( path ){
				var samplePath = IP.sample();
				if( !samplePath )	return false;
				return sample.fullPath.apply( samplePath, arguments );
			};

			IP.safeSample = function (){
				var sample = IP.sample();
				if( !sample ){
					sample = new OSP.InputData();
					IP.sample( sample );
				}
				return sample;
			};

			IP.setSample = function( id, parent, name, type, relative ){
				var sample = IP.safeSample();
				return sample.setPath.apply( sample, arguments );
			};

			IP.sampleUri = function( uri ){
				var sample = IP.safeSample();
				return sample.uri.apply( sample, arguments );
			};

			IP.samplePathType = function( pathType ){
				var sample = IP.safeSample();
				return sample.type.apply( sample, arguments );
			};

			IP.sampleParentFolderPath = function( parentPath ){
				var sample = IP.safeSample();
				return sample.parent.apply( sample, arguments );
			};

			IP.sampleName = function( name ){
				var sample = IP.safeSample();
				return sample.name.apply( sample, arguments );
			};

			IP.sampleRelative = function( relative ){
				var sample = IP.safeSample();
				return sample.relative.apply( sample, arguments );
			};

			IP.getSampleData = function( url, params ){

			};

			IP.clone = function(){
				return new InputPort( OSP.Util.toJSON(IP) );
			};

			IP.deserialize = function( jsonObject ){
				for( var key in jsonObject ){
					switch( key ){
					case OSP.Constants.INPUT_DATA:
						/*
						var inputData = new OSP.InputData( jsonObject[key] );
						IP.inputData( inputData );
						*/
						break;
					case OSP.Constants.SAMPLE:
						var sample = new OSP.InputData( jsonObject[key] );
						IP.sample( sample );
						break;
					default:
						IP._deserialize( key, jsonObject[key] );
					}
				}
			};

			IP.upgrade = function( oldPort ){
				for( var key in oldPort ){
					switch( key ){
					case 'name':
						IP.name( oldPort[key] );
						break;
					case 'default-editor-id':
						IP.defaultEditor( oldPort[key] );
						break;
					case 'default-analyzer-id':
						IP.defaultAnalyzer( oldPort[key] );
						break;
					case 'port-type-name':
						IP.dataType( oldPort[key], '1.0.0' );
						break;
					case 'mandatory':
						IP.mandatory( oldPort[key] );
						break;
					case 'port-type-id':
					case 'inputdeckporttype':
						console.log( 'Deprecated: '+ key );
						break;
					default:
						console.log( 'Unknown attribute: '+ key);
					}
				}

				return IP;
			};

			if( arguments.length === 1 )
				IP.deserialize( jsonObject );
		}; // End of InputPort
		ScienceApp.newInputPort = function( jsonObject ){
			switch( arguments.length ){
				case 0:
					return new InputPort();
				case 1:
					return new InputPort(jsonObject);
				default:
					colsole.log( 'Arguments mismatch: newInputPort');
					return null;
			}
		};

		var OutputPort = function( jsonObject ){
			var OP = this;
			_Port.apply(OP);

			OP.outputData = function( path ){
				return OP.property.apply(OP, OSP.Util.addFirstArgument(OSP.Constants.OUTPUT_DATA, arguments));
			};

			OP.safeOutputData = function(){
				var outputData = OP.outputData();
				if( !outputData ){
					outputData = new OSP.Path();
					OP.outputData( outputData );
				}
				return outputData;
			};

			OP.setOutputDataPath = function(id, parent, name, pathType, relative ){
				var outputData = OP.safeOutputData();
				return outputData.setPath.apply( outputData, arguments );
			};

			OP.outputDataPathType = function( pathType ){
				var outputData = OP.safeOutputData();
				return outputData.type.apply( outputData, arguments );
			};

			OP.outputDataParentFolderPath = function( parentPath ){
				var outputData = OP.safeOutputData();
				return outputData.parent.apply( outputData, arguments );
			};

			OP.outputDataName = function( name ){
				var outputData = OP.safeOutputData();
				return outputData.name.apply( outputData, arguments );
			};

			OP.outputDataRelative = function( relative ){
				var outputData = OP.safeOutputData();
				return outputData.relative.apply( outputData, arguments );
			};

			OP.verifyOutput = function( url, params ){

				return true;
			};

			OP.clone = function(){
				return new OutputPort( OSP.Util.toJSON(OP) );
			};

			OP.deserialize = function( jsonObject ){
				for( var key in jsonObject ){
					if( key === OSP.Constants.OUTPUT_DATA ){
						var outputPath = new OSP.Path( jsonObject[key] );
						OP.outputData( outputPath );
					}else
						OP.property( key, jsonObject[key] );
				}
			};

			OP.upgrade = function( oldPort ){
				for( var key in oldPort ){
					switch( key ){
					case 'name':
						OP.name( oldPort[key] );
						break;
					case 'default-editor-id':
						OP.defaultEditor( oldPort[key] );
						break;
					case 'default-analyzer-id':
						OP.defaultAnalyzer( oldPort[key] );
						break;
					case 'port-type-name':
						OP.dataType( oldPort[key], '1.0.0' );
						break;
					case 'mandatory':
						OP.mandatory( oldPort[key] );
						break;
					case 'data-form':
						var pathType = oldPort[key];
						if( pathType === 'extention' )
							pathType = 'ext';

						var fileName = oldPort['file-name'];
						if( fileName.indexOf( '/' ) == 0 )
							fileName = fileName.slice(1, fileName.length);

						if(fileName.indexOf( 'result') != 0)
							fileName = 'result/'+fileName;

						var filePath = OSP.Util.convertToPath(fileName);

						//console.log( 'filePath: '+JSON.stringify(filePath,null,4));
//						console.log( 'filePath: '+filePath.fileName);
						OP.setOutputDataPath( 0, filePath.parent_, filePath.name_, pathType, true);
						break;
					case 'port-type-id':
					case 'file-name':
					case 'inputdeckporttype':
					case 'type':
						console.log( 'Deprecated: '+ key );
						break;
					default:
						console.log( 'Unknown attribute: '+ key);
					}
				}

				return OP;
			};

			if( arguments.length === 1 )
				OP.deserialize( jsonObject );
		}; // End of OutputPort
		ScienceApp.newOutputPort = function( jsonObject ){
			switch( arguments.length ){
				case 0:
					return new OutputPort();
				case 1:
					return new OutputPort(jsonObject);
				default:
					colsole.log( 'Arguments mismatch: newOutputPort');
					return null;
			}
		};
		ScienceApp.newLogPort = ScienceApp.newOutputPort;
		
		ScienceApp.type = function( type ){
			return ScienceApp.property.apply(ScienceApp, OSP.Util.addFirstArgument(OSP.Constants.TYPE, arguments));
		};
		
		ScienceApp.runType = function( runType ){
			return ScienceApp.property.apply(ScienceApp, OSP.Util.addFirstArgument(OSP.Constants.RUNTYPE, arguments));
		};

		ScienceApp.inputPorts = function( inputPorts ){
			return ScienceApp.property.apply(ScienceApp, OSP.Util.addFirstArgument(OSP.Constants.INPUT_PORTS, arguments));
		};

		ScienceApp.deserializeInputPorts = function( portsJson ){
			if( !portsJson )	return;
			
			//console.log( JSON.stringify(portsJson, null, 4) );
			var ports = ScienceApp.safeInputPorts();
			var index = 1;
			for( var portName in portsJson ){
				var port = ScienceApp.newInputPort(portsJson[portName]);
				port.order(index);
				//console.log( index+ ': '+port.name());
				index++;
				ports[portName] = port;
			}
			
			ScienceApp.inputPorts(ports);

			return ports;
		};
		
		ScienceApp.getOrderdInputPort = function( order ){
			var ports = ScienceApp.inputPorts();
			if( !ports )	return false;
			
			for( var portName in ports ){
				var port = ports[portName];
				if( port.order() === order )	return port;
			}
			
			return false;
		};

		ScienceApp.inputPortsArray = function(){
			var ports = ScienceApp.inputPorts();
			if( !ports )	return [];

			var portsArray = [];
			for( var portName in ports ){
				portsArray.push( ports[portName] );
			}

			return portsArray;
		};
		
		ScienceApp.getInputPortNames = function(){
			var ports = ScienceApp.inputPorts();
			if( !ports )	return [];

			var namesArray = [];
			for( var portName in ports ){
				namesArray.push( portName );
			}

			return namesArray;
		};
		
		ScienceApp.safeInputPorts = function(){
			var inputPorts = ScienceApp.inputPorts();
			if( !inputPorts ){
				inputPorts = {};
				ScienceApp.inputPorts( inputPorts );
			}

			return inputPorts;
		};

		ScienceApp.addInputPort = function( inputPort ){
			var inputPorts = ScienceApp.safeInputPorts();
			inputPorts[inputPort.name()] = inputPort;

			return inputPorts;
		};

		ScienceApp.removeInputPort = function( portName ){
			var inputPorts = ScienceApp.inputPorts();
			if( !inputPorts )	return true;

			return delete inputPorts[portName];
		};

		ScienceApp.inputPort = function( portName ){
			var ports = ScienceApp.inputPorts();
			if( !ports )	return false;
			return ports[portName];
		};
		
		ScienceApp.logPorts = function( logPorts ){
			return ScienceApp.property.apply(ScienceApp, OSP.Util.addFirstArgument(OSP.Constants.LOG_PORTS, arguments));
		};

		ScienceApp.deserializeLogPorts = function( portsJson ){
			if( !portsJson )	return;
			
			var ports = ScienceApp.safeLogPorts();
			for( var portName in portsJson ){
				var port = ScienceApp.newLogPort(portsJson[portName]);
				ports[portName] = port;
			}
			
			ScienceApp.logPorts(ports);

			return ports;
		};

		ScienceApp.safeLogPorts = function(){
			var logPorts = ScienceApp.logPorts();
			if( !logPorts ){
				logPorts = {};
				ScienceApp.logPorts( logPorts );
			}

			return logPorts;
		};

		ScienceApp.logPortsArray = function(){
			var ports = ScienceApp.logPorts();
			if( !ports )	return [];

			var portsArray = [];
			for( var portName in ports ){
				portsArray.push( ports[portName] );
			}

			return portsArray;
		};

		ScienceApp.addLogPort = function( logPort ){
			var logPorts = ScienceApp.safeLogPorts();
			logPorts[logPort.name()] = logPort;

			return logPorts;
		};

		ScienceApp.removeLogPort = function( portName ){
			var logPorts = ScienceApp.logPorts();
			if( !logPorts )	return true;

			return delete logPorts[portName];
		};

		ScienceApp.logPort = function( portName ){
			var ports = ScienceApp.logPorts();
			if( !ports )	return false;
			return ports[portName];
		};
		
		ScienceApp.outputPorts = function( outputPorts ){
			return ScienceApp.property.apply(ScienceApp, OSP.Util.addFirstArgument(OSP.Constants.OUTPUT_PORTS, arguments));
		};

		ScienceApp.deserializeOutputPorts = function( portsJson ){
			if( !portsJson )	return;
			
			var ports = ScienceApp.safeOutputPorts();
			for( var portName in portsJson ){
				var port = ScienceApp.newOutputPort(portsJson[portName]);
				ports[portName] = port;
			}

			ScienceApp.outputPorts(ports);
			return ports;
		};

		ScienceApp.outputPortsArray = function(){
			var ports = ScienceApp.outputPorts();
			if( !ports )	return [];

			var portsArray = [];
			for( var portName in ports ){
				portsArray.push( ports[portName] );
			}

			return portsArray;
		};

		ScienceApp.safeOutputPorts = function(){
			var outputPorts = ScienceApp.outputPorts();
			if( !outputPorts ){
				outputPorts = {};
				ScienceApp.outputPorts( outputPorts );
			}

			return outputPorts;
		};

		ScienceApp.addOutputPort = function( outputPort ){
			var outputPorts = ScienceApp.safeOutputPorts();
			outputPorts[outputPort.name()] = outputPort;

			return outputPorts;
		};

		ScienceApp.removeOutputPort = function( portName ){
			var outputPorts = ScienceApp.outputPorts();
			if( !outputPorts )	return true;

			return delete outputPorts[portName];
		};

		ScienceApp.outputPort = function( portName ){
			var ports = ScienceApp.outputPorts();
			if( !ports )	return false;
			return ports[portName];
		};
		
		ScienceApp.verifyPortName = function( portName ){
			var inputPorts = ScienceApp.inputPorts();
			if( inputPorts ){
				for( var key in inputPorts ){
					var port = inputPorts[key];
					if( port.name() === portName )	return false;
				}
			}
			var logPorts = ScienceApp.logPorts();
			if( logPorts ){
				for( var key in logPorts ){
					var port = logPorts[key];
					if( port.name() === portName )	return false;
				}
			}
			var outputPorts = ScienceApp.outputPorts();
			if( outputPorts ){
				for( var key in outputPorts ){
					var port = outputPorts[key];
					if( port.name() === portName )	return false;
				}
			}
			
			return true;
		};
		
		ScienceApp.getPortType = function( portName ){
			var inputPorts = ScienceApp.inputPorts();
			if( inputPorts ){
				for( var key in inputPorts ){
					var port = inputPorts[key];
					if( port.name() === portName )	return OSP.Enumeration.PortType.INPUT;
				}
			}
			var logPorts = ScienceApp.logPorts();
			if( logPorts ){
				for( var key in logPorts ){
					var port = logPorts[key];
					if( port.name() === portName )	return OSP.Enumeration.PortType.LOG;
				}
			}
			var outputPorts = ScienceApp.outputPorts();
			if( outputPorts ){
				for( var key in outputPorts ){
					var port = outputPorts[key];
					if( port.name() === portName )	return OSP.Enumeration.PortType.OUTPUT;
				}
			}
			
			return 'NPT';
		};
		
		ScienceApp.getPortSample = function( portName ){
			var port = ScienceApp.getPort(portName);
			if( port ){
				return port.sample();
			}
			return false;
		};
		
		ScienceApp.getPort = function( portName ){
			var port = ScienceApp.inputPort( portName );
			if( port ){
				return port;
			}
			port = ScienceApp.logPort(portName);
			if( port ){
				return port;
			}
			port = ScienceApp.outputPort(portName);
			if( port ){
				return port;
			}
			
			return false;
		};
		

		ScienceApp.clone = function(){
			return new OSP.ScienceApp( OSP.Util.toJSON(ScienceApp) );
		};

		ScienceApp.upgradeInputPorts = function( oldPorts ){
			var newPorts = {};
			for( var portName in oldPorts ){
				var oldPort = oldPorts[portName];
				var newPort = ScienceApp.newInputPort();
				//console.log( 'oldPort: ' + JSON.stringify(oldPort,null,4));
				newPort.upgrade( oldPort );
				newPorts[portName] = newPort;
			}
			ScienceApp.inputPorts( newPorts );
			return newPorts;
		};

		ScienceApp.upgradeOutputPorts = function( oldPorts ){
			var newPorts = {};
			for( var portName in oldPorts ){
				var oldPort = oldPorts[portName];
				var newPort = ScienceApp.newOutputPort();
				newPort.upgrade( oldPort );
				newPorts[portName] = newPort;
			}
			ScienceApp.outputPorts( newPorts );
			return newPorts;
		};
	}; // End of ScienceApp

})(window);