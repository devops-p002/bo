// Utility function to handle username clicks and open member profile popup
export const handleUsernameClick = (username) => {
  // Open member profile page in new window (same as MemberSearch functionality)
  window.open(`/members/profile/${username}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
};

// Alternative function if you want to pass additional member data
export const handleUsernameClickWithData = (username, memberData = null) => {
  // You can extend this to pass additional data if needed
  window.open(`/members/profile/${username}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}; 