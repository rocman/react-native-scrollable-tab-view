'use strict';

import React, {
  Animated,
  Component,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function constrainInRange(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

class DefaultTabBar extends Component {
  static propTypes = {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    underlineColor : React.PropTypes.string,
    backgroundColor : React.PropTypes.string,
    activeTextColor : React.PropTypes.string,
    inactiveTextColor : React.PropTypes.string,
  };
  styles = {
    root: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingLeft: 6,
      paddingRight: 6
    },
    leftButton: {
      backgroundColor: 'white',
      width: 28,
      height: 28
    },
    rightButton: {
      backgroundColor: 'white',
      width: 28,
      height: 28
    },
    scrollView: {
      flex: 1,
      marginLeft: 6,
      marginRight: 6
    },
    contentContainer: {
      flex: 1,
      height: 44,
      position: 'relative',
    },
    highlight: {
      borderColor: '#333',
      borderRadius: 14,
      borderWidth: 14,
      position: 'absolute',
      top: 8,
      bottom: 8,
    },
    tabOption: {
      root: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        flex: 1,
        justifyContent: 'center',
        padding: 10
      },
      text: {
        fontSize: 16
      }
    }
  };
  constructor() {
    super(...arguments);
  }
  render() {
    const styles = this.styles;
    
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    
    const {contentSizeOfScrollView, layoutOfScrollView, layoutsOfTabOptions} = this.state || {};
    if (contentSizeOfScrollView && layoutOfScrollView && layoutsOfTabOptions && layoutsOfTabOptions.length) {
      const inputRange = [];
      const outputRangeLeft = [];
      const outputRangeWidth = [];
      const outputRangeOffset = [];
      const maxOffsetX = Math.max(contentSizeOfScrollView.width - layoutOfScrollView.width, 0);
      let temp = 0;
      layoutsOfTabOptions.forEach(function({width}, index) {
        inputRange.push(index);
        outputRangeLeft.push(temp);
        outputRangeWidth.push(width);
        outputRangeOffset.push(constrainInRange(
          /* value */ temp - (layoutOfScrollView.width - width) / 2,
          /* min   */ 0,
          /* max   */ maxOffsetX
        ));
        temp += width;
      });

      if (inputRange.length > 1) {
        const left = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeLeft,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        });

        const width = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeWidth,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        });
        
        var offset = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeOffset,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          mapping: x => ({x})
        });
      }
      
      var highlight = (
        <Animated.View style={[
          styles.highlight, this.props.highlightStyle, {left, width}
        ]} />
      );
    }

    return (
      <View style={[styles.root, this.props.style]}>
        <View style={[styles.leftButton, this.props.leftButtonStyle]}>
        </View>
        <AnimatedScrollView
          automaticallyAdjustContentInsets={false}
          contentContainerStyle={styles.contentContainer}
          contentOffset={offset}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.scrollView}
          onContentSizeChange={this.scrollViewOnContentSizeChange.bind(this)}
          onLayout={this.scrollViewOnLayout.bind(this)}
          onScroll={this.scrollViewOnScroll.bind(this)}>
          {highlight}
          {this.props.tabs.map(this.renderTabOption.bind(this))}
        </AnimatedScrollView>
        <View style={[styles.rightButton, this.props.rightButtonStyle]}>
        </View>
      </View>
    );
  }
  renderTabOption(name, index) {
    const styles = this.styles.tabOption;
    const color = this.props.scrollValue.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: ['white', 'yellow', 'white']
    });
    return (
      <TouchableOpacity
        key={name}
        style={styles.root}
        onPress={e => this.goToPage(index)}
        onLayout={e => this.tabOptionOnLayout(e, index)}>
        <Animated.Text style={[styles.text, {color}]}>{name}</Animated.Text>
      </TouchableOpacity>
    );
  }
  scrollViewOnContentSizeChange(width, height) {
    this.setState({contentSizeOfScrollView: {width, height}});
  }
  scrollViewOnLayout({nativeEvent:{layout}}) {
    this.setState({layoutOfScrollView: layout});
  }
  scrollViewOnScroll({nativeEvent:{contentOffset:{x}}}) {
    console.log('scrollViewOnScroll', x);
    this.scrollViewContentOffsetX = x;
  }
  tabOptionOnLayout({nativeEvent:{layout}}, page) {
    const {layoutsOfTabOptions = []} = this.state || {};
    layoutsOfTabOptions[page] = layout;
    this.setState({layoutsOfTabOptions});
  }
  goToPage(index) {
    let x = this.scrollViewContentOffsetX;
    if (x > 0) {
      const {layoutsOfTabOptions} = this.state || {};
      if (layoutsOfTabOptions) {
        for (let i = 0, j = layoutsOfTabOptions.length; i < j; i++) {
          const layout = layoutsOfTabOptions[i];
          if (layout == null) {
            break;
          }
          if (x > layout.width) {
            x -= layout.width;
            continue;
          }
          return this.props.goToPage(index, i + x / layout.width);
        }
      }
    }
    return this.props.goToPage(index);
  }
}

module.exports = DefaultTabBar;
export default DefaultTabBar;