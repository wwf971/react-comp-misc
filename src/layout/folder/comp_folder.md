




## Column Width Resize Behavior

Dragging the column border(divider line between two columns, or column left/right edge) to change column size should be a supported feature.
There are two column width resize mode: preview, and immediate, with the former being default.

The following behavior rule is mainly for preview mode. But for immediate mode, there should be similar/corresponding behavior.

1. If user drags beyond limit, for example if further dragging the column border will make some width limit in column width config broken, then dragging will no longer move the indicator line. If user release mouse in this situation, an update attempt will be made to update the column border position at the current position. Similarly, in immediate mode, dragging will no longer update the current column border.

2. If user mouse drags beyond limit, and then user mouse returns to the horizontal position when the indicator line currently lies(at the extreme position where it cannot go further beyond), then if the indiator line will follow the user mouse again, if user mouse keeps moving in legal range.

### Smoothness

In preview mode, dragging to resize column width must stay smooth regardless of the number of rows in the body. While dragging, only the indicator line moves; the body rows must not be re-rendered on mouse move, since widths are only committed on mouse release. Row count must therefore be irrelevant to drag smoothness in preview mode.

### Tolerance

the dragging mode should be trigger if dragging starts with mouse press falls within certain range from column border. this tolerance has a default value, but should be configureable via prop. Higher tolerance value means lower sensitivity, with a larger area where dragging to resize behavior can be triggered.


## Last Column Fill Mode

this mode will be ignored, when the column width setting makes it impossible to accomodate all the columns just at the container width, for example if minimum width limits in some columns sum to a value over container width.

there should be a boolean variable marking this state, and this variable will be re-computed upon column width config update.
