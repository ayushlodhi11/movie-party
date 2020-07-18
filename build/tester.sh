# location="./build/test_coverage.txt"

# cat $location
# percentage=$(grep 'All files' $location | awk -F '|' '{print $5}' | sed 's/^[te \t]*//')
# testFailed=$(grep 'Test Suites' $location)

# echo "Coverage:" ${percentage} > $location

# if [[ $testFailed == *"failed"* ]];then
#   echo "Test Status: Failed" >> $location
# else
#   echo "Test Status: Passed" >> $location
# fi
