//
//  CDVSpinnerDialog.h
//  HelloWorld
//
//  Created by Domonkos Pál on 2014.01.27..
//  Edited by mcler on 2014.10.20
//
//

#import <Cordova/CDVPlugin.h>

@interface CDVSpinnerDialog : CDVPlugin

- (void)show:(CDVInvokedUrlCommand*)command;
- (void)hide:(CDVInvokedUrlCommand*)command;
    
@end
