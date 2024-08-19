$(document).ready(function() {
    $('#change-password-form').submit(function(event) {
        event.preventDefault();

        var currentPassword = $('#current-password').val();
        var newPassword = $('#new-password').val();
        var confirmPassword = $('#confirm-password').val();

        // 새로운 비밀번호와 확인용 비밀번호가 일치하는지 확인
        if (newPassword !== confirmPassword) {
            alert('새로운 비밀번호와 확인용 비밀번호가 일치하지 않습니다.');
            return;
        }

        // 서버로 전송할 데이터 구성
        var data = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        // AJAX 요청을 통해 서버로 데이터 전송
        $.ajax({
            type: 'POST',
            url: '/admin/changePassword', // 비밀번호 변경 엔드포인트 URL
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                alert(response.message); // 성공 또는 실패 메시지 표시
                window.location.href = '/admin/logout'
            },
            error: function(xhr, status, error) {
                console.error('비밀번호 변경 중 오류 발생:', error);
                alert('비밀번호 변경에 실패했습니다.');
            }
        });
    });
});
